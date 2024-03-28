"use server"
import axios from 'axios';

export async function getDonations() {
    try{
        const donations = await axios.get('https://transaction-platform-be.onrender.com/api/v1/alldons')
        return donations.data
    }catch(error){
        console.log(error);
        return error
    }
}