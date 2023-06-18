import PouchDB from "pouchdb-browser";
import Worker from 'worker-pouch';

PouchDB.adapter('worker', Worker);
export const db = new PouchDB('xiaohongshu', {adapter: 'worker'})

await window.dshell.init();
export const shell = window.dshell;

export const fetch = window.edgeFetch;