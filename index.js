import fetch from 'node-fetch'
import { SocksProxyAgent } from 'socks-proxy-agent'
import fs from 'fs'
import 'dotenv/config'

const getFaucet = (a) =>
  new Promise((resolve, reject) => {
    fetch('https://faucet.nubit.org/api/v1/faucet/give_me', {
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        priority: 'u=1, i',
        'sec-ch-ua':
          '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        Referer: 'https://faucet.nubit.org/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      body: `{"address":"${a}","chainId":"nubit-alphatestnet-1"}`,
      method: 'POST',
      agent: new SocksProxyAgent(`socks://${process.env.PROXY}`),
    })
      .then((res) => res.json())
      .then((data) => resolve(data))
      .catch((err) => reject(err))
  })

;(async () => {
  try {
    const walletAdress = fs.readFileSync('./list.txt', 'utf8').split('\r\n')

    for (let i = 0; i < walletAdress.length; i++) {
      console.log(`Try to get faucet ${walletAdress[i]}`)
      let a = walletAdress[i].replace(/\s/g, '')
      let status = true
      while (status) {
        const resultFaucet = await getFaucet(a)
        if (resultFaucet) {
          console.log(resultFaucet)
          status = false
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
})()
