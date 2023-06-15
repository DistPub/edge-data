import PouchDB from "pouchdb-browser";
import Worker from 'worker-pouch';
import React from "react";

PouchDB.adapter('worker', Worker);
let db = new PouchDB('xiaohongshu', {adapter: 'worker'})
export const PouchDBContext = React.createContext(db);
