import { log, AsyncFunction, AsyncGeneratorFunction, GeneratorFunction, generateUUID, sleep } from "./utils.js"
import { collect } from 'https://cdn.jsdelivr.net/npm/streaming-iterables@5.0.3/dist/index.mjs'
import { ActionHelper, proxyHandler} from "./action-helper.js"
import ActionResponse from './action-response.js'
import { itPipe, EventEmitter, cloneDeep } from "./dep.js"

const UUID_SIZE = 36

class Shell extends EventEmitter{
  constructor(userNode, soul) {
    super({wildcard: true})
    this.soul = soul
    this.userNode = userNode
    this.addEventListener()
    this.soul.addEventListener(this)
    this.UUIDNameSpace = generateUUID()
  }

  addEventListener() {
    this.userNode.on('handle:request', data => this.emit('action:request', data))
    this.userNode.on('handle:response', data => this.emit('action:response', data))
    this.on('uuid.*', this.createActionEventHandler(this))
  }

  createActionEventHandler(shell) {
    async function handler(message) {
      let event = this.event // uuid.xxx-xxx:*
      const offset = 'uuid.'.length
      const source = event.slice(offset, offset + UUID_SIZE)
      const {meta, data, direction} = message

      if (source !== meta.uuid) {
        throw 'action event name\'s uuid must equal to meta.uuid!'
      }

      // sugar action will listen on 'uuid:xxx-xxx.*'
      const sugarEventName = event.replace(':', '.').replace('.', ':')
      // normal action will listen on 'uuid:xxx-xxx:foo'
      const normalEventName = event.replace('.', ':')

      let normal = []
      let sugar = []
      const addDestination = (stream) => {
        if (!stream) {
          return
        }

        if (stream.sugar) {
          sugar = sugar.concat(stream.host)
        } else if (stream.host) {
          normal = normal.concat(stream.host)
        }
      }

      if (direction === 'upstream') {
        addDestination(meta.upstream)
      } else if (direction === 'downstream') {
        addDestination(meta.downstream)
      } else {
        addDestination(meta.upstream)
        addDestination(meta.downstream)
      }

      if (sugar.length) {
        await shell.fire(meta.commander.host, sugar, sugarEventName, data)
      }

      if (normal.length) {
       await shell.fire(meta.commander.host, normal, normalEventName, data)
      }
    }
    return handler
  }

  async fire(commander, to, event, data) {
    const destination = new Set(to)
    const localhost = this.userNode.id

    if (destination.has(localhost)) {
      destination.delete(localhost)
      this.emit(event, data)
    }

    if (!destination.size) {
      return
    }

    const action = {receivers: [...destination], action: '/FireEvent', args: [event, data]}

    if (commander === localhost) {
      return await this.exec(action)
    }

    return await this.exec({receivers: [commander], action: '/Xargs', args: [action]})
  }

  ensureAction({ topic='topic', receivers=[], action='/Ping', args=[], meta={} }, uuid=false) {
    if (uuid && !meta.uuid) {
      meta.uuid = generateUUID(this.UUIDNameSpace)
    }
    return {topic, receivers, action, args, meta}
  }

  async exec(action) {
    // if action is helper or other args contains none `simple type` data
    action = JSON.parse(JSON.stringify(action))

    const response = new ActionResponse(action)
    for await (const item of this.execGenerator(this.ensureAction(action))) {
      response.add(item)
    }

    // summarize action experiences
    try {
      await this.soul.summarize()
    } catch (error) {
      log(`summarize action experiences error: ${error}`)
    } finally {
      return response
    }
  }

  execGenerator({ topic, receivers, action, args, meta }, pipe=false) {
    if (!receivers.length) {
      return this.applyAction(topic, action, args, pipe, meta)
    } else {
      return this.rpc(topic, receivers, action, args, pipe, meta)
    }
  }

  createPipeExecGenerator(action) {
    async function* wrapper(preActionResponses) {
      for await (const item of preActionResponses) {
        const nextAction = cloneDeep(action)

        if (!item.response.results.ignore) {
          let preActionResults = [item.response.results]

          if (nextAction.meta.flatPreActionResults) {
            preActionResults = preActionResults.flat()
          }

          nextAction.args = nextAction.args.concat(preActionResults)
        }

        yield* this.execGenerator(nextAction, true)
      }
    }
    return wrapper.bind(this)
  }

  async *rpc(topic, receivers, action, args, pipe, meta) {
    const id = this.userNode.id
    const username = this.userNode.username

    for (const receiver of receivers) {
      // self call
      if (receiver === id) {
        yield* this.applyAction(topic, action, args, pipe, meta)
        continue
      }

      if (!pipe) {
        this.emit('action:request', cloneDeep({
          topic,
          receiver: receiver,
          request: {action, args},
          sender: id,
          username
        }))
      }

      const responses = []
      let pipeEnd = false
      const message = [username, topic, meta].concat(args)
      this.userNode.pipe([message], [receiver, action], ([remoteUser, status, results]) => {
        responses.push({
          topic,
          sender: receiver,
          username: remoteUser,
          receiver: id,
          response: {status, results}
        })
      }, (error) => {
        pipeEnd = true

        if (error) {
          responses.push({
            topic,
            sender: receiver,
            username: null,
            receiver: id,
            response: {status: 1, results: `rpc error: ${error}`}
          })
        }
      })

      while (!pipeEnd || responses.length) {
        const response = responses.shift()
        if (response) {
          yield response
          if (!pipe) {
            this.emit('action:response', cloneDeep(response))
          }
        } else {
          await sleep(100)
        }
      }
    }
  }

  async *applyAction(topic, action, args, pipe, meta) {
    const id = this.userNode.id
    const username = this.userNode.username

    if (!meta.uuid) {
      meta.uuid = generateUUID(this.UUIDNameSpace)
    }

    if (!pipe) {
      this.emit('action:request', cloneDeep({
        topic,
        receiver: id,
        request: {action, args},
        sender: id,
        username: username
      }))
    }

    let status = 0
    let generator

    const response = {
      topic,
      sender: id,
      username: username,
      receiver: id,
      response: { status }
    }

    try {
      let func = null

      // action under namespace
      if (action[0] === ':') {
        func = this['action$' + action.slice(1).replace('/', '')]
      } else {
        func = this['action' + action.slice(1)]
      }
      const di = { topic, soul: this.soul, exec: this.exec.bind(this), meta }

      if (func instanceof AsyncGeneratorFunction || func instanceof GeneratorFunction) {
        generator = func.apply(this, [di, ...args])
      } else if (func instanceof AsyncFunction) {
        generator = (async function* (self) { yield await func.apply(self, [di, ...args]) })(this)
      } else if (func instanceof Function) {
        generator = (function* (self) { yield func.apply(self, [di, ...args]) })(this)
      } else {
        throw `${action} action not supported in the shell`
      }

      for await (const item of generator) {
        if (item === undefined) {
          response.response.results = null
        } else {
          response.response.results = item
        }

        yield cloneDeep(response)

        if (!pipe) {
          this.emit('action:response', cloneDeep(response))
        }
      }
    } catch(error) {
      response.response.status = 1
      response.response.results = error.toString()
      console.error(error.stack)

      yield response
      if (!pipe) {
        this.emit('action:response', cloneDeep(response))
      }
    }
  }

  install() {
    Object.getOwnPropertyNames(Shell.prototype).filter(name =>
      name.startsWith('action') && name.length > 'action'.length && typeof this[name] === 'function'
    ).map(action =>
      ['/' + action.slice('action'.length), this[action].bind(this)]
    ).forEach(([protocol, action]) =>
      this.installRemoteAction(protocol, action)
    )
  }

  installExternalAction(action, namespace=null) {
    let actionName = action.name
    const first = actionName[0]

    if (first !== first.toUpperCase()) {
      log(`[WARN] install external action(${action.name}) first letter is not upper case, auto correct!`)
      actionName = first.toUpperCase() + actionName.slice(1)
    }

    if (namespace) {
      Shell.prototype[`action$${namespace}${actionName}`] = action.bind(this)
      this.installRemoteAction(`:${namespace}/${actionName}`, action.bind(this))
    } else {
      Shell.prototype[`action${actionName}`] = action.bind(this)
      this.installRemoteAction(`/${actionName}`, action.bind(this))
    }
  }

  async installModule(...pathes) {
    for (const path of pathes) {
      try {
        let actions = path

        if (typeof path === 'string') {
          actions = (await import(path)).default
        }

        actions.filter(action => typeof action === 'function').forEach(action => this.installExternalAction(action))
        log(`install module(${path}) success`)
      } catch (error) {
        log(`install module(${path}) error: ${error}`)
      }
    }
  }

  installRemoteAction(protocol, action) {
    this.userNode.installHandler(
      protocol,
      this.userNode.createProtocolHandler(
        action, this.soul, this.exec.bind(this), this.UUIDNameSpace))
  }

  /* built-in action */

  /**
   * Ping
   * @returns {string} pong
   */
  actionPing() {
    return 'pong'
  }

  /**
   * Show the username
   *  Note: this example use `object` type as action argument payload, so that client can pass keyword args
   *
   * @param meta -
   *  If this is a remote action call, meta contains { connection, stream, id, username, topic, soul, meta }
   *  If this is a local action call, meta contains { topic, soul, meta }
   *
   *  Note: the inner `meta` is for runtime control, current contains:
   *    - flatPreActionResults
   * @param help - Show help message
   * @param version - Show version message
   * @return {string} The username
   */
  actionWhoami(meta, {help, version}={}) {
    if (help) {
      return 'show the username related to the peer id'
    } else if (version){
      return '1.0.0'
    } else {
      return this.userNode.username
    }
  }

  /**
   * Echo message
   *  Note: this example use `array` type as action argument payload, so that client can only pass position args
   *
   * @param _ - Meta data, this action don't care, so it give a `_` variable name
   * @param args - Need echo messages
   * @returns {string} - Combined message
   */
  actionEcho(_, ...args) {
    return args.join(' ')
  }

  /* sugar action */

  /**
   * Exec action in pipe
   *
   * @param meta - Meta data
   * @param actions - Action array
   * @returns {Promise.<[ActionResponse]>} Action responses
   */
  async actionPipeExec({meta}, ...actions) {
    const execs = [[{ response: { results: { ignore: true } } }]]
    actions = actions.map(action => this.ensureAction(action, true))

    const getStream = idx => {
      if (idx === -1 || idx === actions.length) {
        return {host: [this.userNode.id], uuid: meta.uuid, sugar: true}
      }
      const action = actions[idx]
      return {
        host: action.receivers.length ? action.receivers : [this.userNode.id],
        uuid: action.meta.uuid,
        sugar: action.action === '/PipeExec'}
    }
    const getActionUUID = idx => actions[idx].meta.uuid
    const reEmitEvent = direction => {
      const shell = this
      function handler(data) {
        const event = `uuid.${meta.uuid}:${this.event.slice('uuid:'.length + UUID_SIZE + 1)}`
        shell.emit(event, {meta, data, direction})
      }
      return handler
    }
    const fireTo = (idx) => {
      const shell = this
      const action = actions[idx]
      const sugar = action.action === '/PipeExec'
      function handler(data) {
        const event = `uuid:${meta.uuid}${sugar?'.':':'}${this.event.slice('uuid:'.length + UUID_SIZE + 1)}`
        shell.fire(meta.commander.host, action.receivers.length ? action.receivers : [shell.userNode.id], event, data)
      }
      return handler
    }

    const listeners = []

    // normal event re-emit to sugar level
    listeners.push(this.on(`uuid:${getActionUUID(0)}.*`, reEmitEvent('upstream'), {objectify: true}))
    listeners.push(this.on(`uuid:${getActionUUID(actions.length - 1)}.*`, reEmitEvent('downstream'), {objectify: true}))

    // sugar event fire to related sugar or action
    if (meta.upstream) {
      listeners.push(this.on(`uuid:${meta.upstream.uuid}.*`, fireTo(0), {objectify: true}))
    }

    if (meta.downstream) {
      listeners.push(this.on(`uuid:${meta.downstream.uuid}.*`, fireTo(actions.length - 1), {objectify: true}))
    }

    try {
      for (const [idx, action] of actions.entries()) {
        action.meta.commander = { host: this.userNode.id, uuid: meta.uuid }
        action.meta.upstream = getStream(idx - 1)
        action.meta.downstream = getStream(idx + 1)
        execs.push(this.createPipeExecGenerator(action))
      }
      execs.push(collect)
      return await itPipe(...execs)
    } finally {
      listeners.map(listener => listener.off())
    }
  }

  /**
   * Yield each item of iterable variable
   * @param _ - unused
   * @param args - Iterators
   */
  async *actionMapArgs(_, ...args) {
    for (const iterable of args) {
      yield* iterable
    }
  }

  /**
   * Reduce PipeExec or Parallel action results
   * @param _ - unused
   * @param pipeResults - ActionResponse array
   * @returns {Array} - Pure results array
   */
  actionReduceResults(_, pipeResults) {
    return pipeResults.map(item => item.response.results)
  }

  /**
   * Flat more args and exec action
   *  Note: If your only have one args need flat, you can set `meta.flatPreActionResults` to a normal action
   * @param exec - shell.exec
   * @param action - action
   * @param more - more args
   * @returns {Promise.<json>} action response
   */
  async actionXargs({exec}, action, ...more) {
    action = this.ensureAction(action)
    action.args = action.args.concat(more.flat())
    const response = await exec(action)
    return response.json()
  }

  /**
   * Parallel exec action
   * @param exec - shell.exec
   * @param action - action
   * @param callbackAction - callback action
   * @param batch - how many actions to parallel exec
   * @param more - more args
   * @returns {Promise.<*>} action response
   */
  async actionParallelExec({exec}, action, callbackAction, batch, ...more) {
    action = this.ensureAction(action)
    let waits = []
    let responses = []
    const flushWaits = async () => {
      responses = responses.concat(await Promise.all(waits))
      waits = []
    }

    if (callbackAction) {
      callbackAction = this.ensureAction(callbackAction)
    }

    const doCallbackAction = async (results) => {
      let command = cloneDeep(callbackAction)
      command.args = command.args.concat([action, results])
      await exec(command)
    }

    for (const args of more) {
      const command = cloneDeep(action)
      command.args = action.args.concat(args)
      let promise = exec(command)

      if (callbackAction) {
        promise.then(doCallbackAction).catch(doCallbackAction)
      }

      waits.push(promise)

      if (waits.length === batch) {
        await flushWaits()
      }
    }

    if (waits.length) {
      await flushWaits()
    }

    return responses.map(item => item.payloads).reduce((a, b) => a.concat(b), [])
  }

  /**
   * Fire event in current host
   * @param _ - meta info
   * @param event - event fired
   * @param data - event data
   * @returns {Promise.<void>}
   */
  actionFireEvent(_, event, data) {
    this.emit(event, data)
  }

  /* action helper */

  /**
   * Action helper
   *  use helper can make pipe action more effective
   *
   *  example:
   *    actionPlus = (_, a, b) => a + b
   *    actionSum = (_, args) => args.reduce((a, b) => a + b, 0)
   *    await shell.exec(shell.Action.map([[1,2,3]]).plus([1]).Collect.Sum)
   *    equal => await shell.exec({
   *      action: '/PipeExec',
   *      args: [
   *        {
   *          action: '/PipeExec',
   *          args: [
   *            {action: '/MapArgs', args: [[1,2,3]]},
   *            {action: '/Plus', args: [1]}
   *          ]
   *        },
   *        {action: '/ReduceResults'},
   *        {action: '/Sum'},
   *      ]
   *    })
   * @param autoPipe - If auto use pipe action when actions more than one
   * @param pipeOption - pipe option
   * @param actions - Actions
   * @param namespace - action namespace
   * @returns {Proxy} Proxy action helper so that it can dynamic get action from shell
   */
  action(autoPipe=true, pipeOption={}, actions=[], namespace=null) {
    return new Proxy(new ActionHelper(this, autoPipe, pipeOption, actions, namespace), proxyHandler)
  }

  /**
   * Getter for action helper method
   *  Note: **All Action** in shell can be access by two ways
   *    1. getter with default arguments, the action name first letter is upper case
   *      example: shell.Action.Sum or shell.Action.Plus
   *    2. function, the action name first letter is lower case
   *      example: shell.Action.sum(option) or shell.action.plus(option)
   *  Note: helper contains some alias action(e.g. map/reduce/pipe) and some shortcut action(e.g. collect)
   */
  get Action() {
    return this.action()
  }
}

export default Shell