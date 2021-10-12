function getProductFileList(todo, interval){
  todo();
  setTimeout(getProductFileList, interval)
}

function setRegular(todo=() => {}, targetTime={ hour: 0, minute: 0, second: 0 }, interval=24 * 3600 * 1000){
  const nowTime = new Date();
  const nowSeconds = nowTime.getHours() * 3600 + nowTime.getMinutes() * 60 + nowTime.getSeconds();
  const targetSeconds = targetTime.hour * 3600 + targetTime.minute * 60 + targetTime.second;
  const timeInterval = targetSeconds > nowSeconds ? targetSeconds - nowSeconds: targetSeconds + 24 * 3600 - nowSeconds;
  setTimeout(() => getProductFileList(todo, interval), timeInterval * 1000);
};
  
module.exports = setRegular;