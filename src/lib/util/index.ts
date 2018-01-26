import decycle from "./decycle";
import humanizeList from "./humanizeList";
import humanizeListOptionals from "./humanizeListOptionals";
import jsonToYaml from "./jsonToYaml";
import loadAttachment from "./loadAttachment";
import resolveChannel from "./resolveChannel";
import resolveMember from "./resolveMember";
import resolveUser from "./resolveUser";
import stripBotData from "./stripBotData";
import toFullName from "./toFullName";
import { IDingyUtils } from "../../interfaces";

const util: IDingyUtils = {
    decycle,
    humanizeList,
    humanizeListOptionals,
    jsonToYaml,
    loadAttachment,
    resolveChannel,
    resolveMember,
    resolveUser,
    stripBotData,
    toFullName,
};

export default util;
