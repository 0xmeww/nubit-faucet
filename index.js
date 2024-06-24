import fetch from 'node-fetch'
import { SocksProxyAgent } from 'socks-proxy-agent'
import fs from 'fs'
import 'dotenv/config'
import delay from 'delay'

const getFaucet = (a, b, c) =>
  new Promise((resolve, reject) => {
    fetch('https://faucet.nubit.org/api/v1/faucet/give_me', {
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        priority: 'u=1, i',
        'sec-ch-ua':
          '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        Referer: 'https://faucet.nubit.org/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      body: `{"address":"${a}","chainId":"nubit-alphatestnet-1","token":"${b}","idempotency_key":"${c}"}`,
      method: 'POST',
      agent: new SocksProxyAgent(`socks://${process.env.PROXY}`),
    })
      .then((res) => res.json())
      .then((data) => resolve(data))
      .catch((err) => reject(err))
  })

const solverCaptcha = () =>
  new Promise((resolve, reject) => {
    fetch('https://api.2captcha.com/createTask', {
      method: 'POST',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
        'sec-ch-ua':
          '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        Accept: '*/*',
      },

      body: JSON.stringify({
        clientKey: `${process.env.TWOCAPTCHA_API_KEY}`,
        task: {
          type: 'TurnstileTaskProxyless',
          websiteURL: 'https://faucet.nubit.org/',
          websiteKey: '0x4AAAAAAAdJW-IDLSL6cnoq',
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => resolve(data.taskId))
      .catch((err) => reject(err))
  })

const solverCaptchaResult = (id) =>
  new Promise((resolve, reject) => {
    fetch(
      `https://2captcha.com/res.php?key=${process.env.TWOCAPTCHA_API_KEY}&action=get&id=${id}&json=1`,
      {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
          'sec-ch-ua':
            '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          Accept: '*/*',
        },
      }
    )
      .then((res) => resolve(res.json()))
      .catch((err) => reject(err))
  })

;(async () => {
  try {
    const walletAdress = fs.readFileSync('./list.txt', 'utf8').split('\r\n')

    for (let i = 0; i < walletAdress.length; i++) {
      console.log(`Try to get faucet ${walletAdress[i]}`)
      let a = walletAdress[i].replace(/\s/g, '')
      const id = await solverCaptcha()
      let status = true
      while (status) {
        const result = await solverCaptchaResult(id)
        if (result.status === 1) {
          status = false
          let b = result.request
          let c = Date.now()
          const faucet = await getFaucet(a, b, c)
          if (faucet) {
            console.log(faucet)
          }
        }
      }
      await delay(5000)
    }
  } catch (error) {
    console.log(error)
  }
})()
