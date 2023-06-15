import PouchDB from "pouchdb-browser";
import React from "react";

let db = new PouchDB('xiaohongshu')
export const PouchDBContext = React.createContext(db);
