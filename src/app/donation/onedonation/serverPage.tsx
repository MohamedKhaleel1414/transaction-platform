"use server"
import axios from 'axios';

export async function getOneDonation(uuid: string) {
    try{
        const donation = await axios.get(`https://transaction-platform-be.onrender.com/api/v1/don/${uuid}`)
        return donation.data
    }catch(error){
        console.log(error);
        return error
    }
}

export async function getPayments(id: string) {
    try{
        const payment = await axios.get(`https://transaction-platform-be.onrender.com/api/v1/getpayment/${id}`)
        return payment.data
    }catch(error){
        console.log(error);
        return error
    }
}

export async function updateDon(data: any, uuid: string) {
    try{
        const updated = await axios.patch(`https://transaction-platform-be.onrender.com/api/v1/updatedon/${uuid}`,data)
        return updated.data
    }catch(error){
        console.log(error);
        return error
    }
}

export async function refund(data: any) {
    try{
        const created = await axios.post(`https://transaction-platform-be.onrender.com/api/v1/createpayment`, data)
        return created.data        
    }catch(error){
        console.log(error)
        return error
    }
}