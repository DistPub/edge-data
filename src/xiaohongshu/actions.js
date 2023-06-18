import {getDataSummary} from "./fetches";

export async function InfoFetch(_, pid) {
    getDataSummary(pid)
}