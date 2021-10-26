const moment = require('moment');
const url = require('url');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
const setTime = require('./utils/setTime');

const axios = require('axios').default.create({ validateStatus: false });
const headers = {
  'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 9; MI 6 MIUI/20.6.18)'
};

async function get_app_token(login_token) {
  const resp = await axios.get("https://account-cn.huami.com/v1/client/app_tokens", {
    headers,
    params: {
      app_name: 'com.xiaomi.hm.health',
      dn: "api-user.huami.com,api-mifit.huami.com,app-analytics.huami.com",
      login_token,
    }
  });

  return resp.data.token_info.app_token;
};

async function login(user, password) {
  const resp = await axios.request({
    method: 'post',
    maxRedirects: 0,
    url: `https://api-user.huami.com/registrations/+86${user}/tokens`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "User-Agent": "MiFit/4.6.0 (iPhone; iOS 14.0.1; Scale/2.00)"
    },
    data: querystring.stringify({
      "client_id": "HuaMi",
      "password": password,
      "redirect_uri": "https://s3-us-west-2.amazonaws.com/hm-registration/successsignin.html",
      "token": "access"
    })
  });
  const { searchParams } = new url.URL(resp.headers.location)
  const access = searchParams.get('access');

  const { data } = await axios.request({
    method: 'post',
    url: "https://account.huami.com/v2/client/login",
    headers,
    data: querystring.stringify({
      "app_name": "com.xiaomi.hm.health",
      "app_version": "4.6.0",
      "code": access,
      "country_code": "CN",
      "device_id": "2C8B4939-0CCD-4E94-8CBA-CB8EA6E613A1",
      "device_model": "phone",
      "grant_type": "access_token",
      "third_name": "huami_phone",
    })
  });

  const login_token = data["token_info"]["login_token"]
  const user_id = data["token_info"]["user_id"]

  console.log(`登陆成功--user_id--${user_id}`);
  return { login_token, user_id };
};

async function main(username, password, step) {
  let user;
  let user_id;
  let app_token;
  user = await login(username, password);
  app_token = await get_app_token(user.login_token);
  user_id = user.user_id;
  const today = moment().format('YYYY-MM-DD');

  const data_json = await fs.promises.readFile(path.resolve(__dirname, 'data.txt'), { encoding: 'utf8' });
  const { data } = await axios.request({
    method: 'post',
    url: `https://api-mifit-cn.huami.com/v1/data/band_data.json?t=${Date.now()}`,
    headers: {
      "apptoken": app_token,
      "Content-Type": "application/x-www-form-urlencoded",
      ...headers
    },
    data: querystring.stringify({
      userid: user_id,
      last_sync_data_time: 1597306380,
      device_type: 0,
      last_deviceid: "DA932FFFFE8816E7",
      data_json: decodeURIComponent(
        data_json
          .toString()
          .replace(/(date%22%3A%22).*?(%22%2C%22data)/g, `$1${today}$2`)
          .replace(/(ttl%5C%22%3A).*?(%2C%5C%22dis)/g, `$1${step}$2`)
      )
    })
  })
  if (data.message == 'invalid token') {
    setTimeout(() => {
      main(username, password, step);
    }, 1000 * 60);
    return;
  };

  if (data.message == 'success') {
    console.log('帐号', username, '提交', step, '步成功');
    return;
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setStep() {
  const nowday = new Date().getDay();
  if (nowday === 6 || nowday === 0) {
    return [14000, 26000];
  } else {
    return [7000, 13000];
  };
};

const todo = () => main(
  '18875018235',
  'zxcvbnm123',
  getRandomInt(...setStep())
);

console.log('开始走起');
setInterval(() => {
  console.log(`跑哟。。。。${new Date().toLocaleString()}`);
}, 60 * 1000);

setTime(todo, { hour: 9, minute: 43, second: 0 });
