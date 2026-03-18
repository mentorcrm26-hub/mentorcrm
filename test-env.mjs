import { google } from 'googleapis'
import 'dotenv/config'

async function test() {
    console.log('ID:', process.env.GOOGLE_CLIENT_ID ? 'Loaded' : 'Missing')
    console.log('Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Loaded' : 'Missing')
    console.log('URL:', process.env.NEXT_PUBLIC_APP_URL ? 'Loaded' : 'Missing')
}

test()
