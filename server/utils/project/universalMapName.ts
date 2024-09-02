import { isNumber } from "../isNum";

const versionRegex = /[vV]?(\d.?)+/;

const whitespaceRegex = /[ _]/;

export function getUniversalMapName(mapName: string) {
  const splitName = mapName.split(whitespaceRegex);
  if (splitName.length === 1) return mapName;

  if (versionRegex.test(mapName))
    return splitName.slice(0, splitName.length - 1).join(" ");

  return splitName.join(" ");

  //const potentialVersion = splitName[splitName.length - 1]
  //if(potentialVersion.startsWith('v') || potentialVersion.startsWith('V')) {
  //  const potentialValue = potentialVersion.slice(1)
  //  if(!isNumber(potentialValue))
  //    return mapName

  //  return splitName.slice(0, splitName.length - 1).join('_')
  //}

  //if(!isNumber(potentialVersion))
  //  return mapName

  //return splitName.slice(0, splitName.length - 1).join('_')
}
