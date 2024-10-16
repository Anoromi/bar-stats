import { randColor } from "./randColor"

const blueUniformColors : [string, string][]  =  [
  ["#0B3EF3", "Blue"],
  ["#0CE908", "Green"],
  ["#00f5e5", "Cyan"],
  ["#6941f2", "Purple"],
  ["#8fff94", "Mint"],
  ["#1b702f", "Forest"],
  ["#7cc2ff", "Sky"],
  ["#a294ff", "Lavender"],
  ["#0B849B", "Teal"],
  ["#689E3D", "Olive"],
  ["#4F2684", "Grape"],
  ["#2C32AC", "Indigo"],
  ["#6968AO", "Slate"],
  ["#D8EEF", "Ice"],
  ["#3475FF", "Azure"],
  ["#7EB900", "Leaf"],
  ["#4A4376", "Midnight"],
  ["#B7EA63", "Lime"],
  ["#C4A9FF", "Mauve"],
  ["#37713A", "Fern"],
]

const redUniformColors : [string, string][] = [
  ["#FF1005", "Red"],
  ["#FFD200", "Yellow"],
  ["#FF6107", "Orange"],
  ["#F80889", "Magenta"],
  ["#FCEEA4", "Tan"],
  ["#8A2828", "Maroon"],
  ["#F190B3", "Pink"],
  ["#C88B2F", "Brown"],
  ["#B04523", "Clay"],
  ["#FFBB7C", "Peach"],
  ["#A35274", "Wine"],
  ["#773A01", "Chocolate"],
  ["#F5A200", "Gold"],
  ["#BBA28B", "Cement"],
  ["#971C48", "Garnet"],
  ["#FF68EA", "Bubblegum"],
  ["#DD783F", "Cinnamon"],
  ["#FFAAF3", "Rose"],
  ["#764A4A", "Chestnut"],
  ["#9F0D05", "Crimson"],

]

export function getUniformColorRed(index: number) {
  if(index > blueUniformColors.length) {
    console.error("Requested too many colors", index)
    return [randColor(), "Unknown"]

  }
  return blueUniformColors[index]
}

export function getUniformColorBlue(index: number) {
  if(index > redUniformColors.length) {
    console.error("Requested too many colors", index)
    return [randColor(), "Unknown"]

  }
  return redUniformColors[index]
}

