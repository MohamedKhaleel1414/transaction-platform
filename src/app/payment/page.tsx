"use client"
import React from 'react';
import IconButton from '@mui/material/IconButton';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
import { getPayments, getDonations } from './serverPage';
import { Skeleton } from "@nextui-org/react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function Home() {
    const [data, setData] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState<boolean>(true)
    const [payments, setPayments] = React.useState<any[]>([])
    const router = useRouter()
    React.useEffect(() => {
        async function get() {
            const res = await getDonations()
            console.log(res.data);
            if (res) {
                setData(res.data)
                setLoading(false)
            }
        }
        get()
    }, [])
    const FormSchema = z.object({
        selection: z
            .string({
                required_error: "Choose Donation",
            }),
    })
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })
    async function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data)
        const res = await getPayments(data.selection)
        console.log(res.data)
        if(res.status === 200){
            setPayments(res.data)
        }
    }
    return (
        <div className="p-4 mt-12">
            <p className=' text-3xl font-semibold mb-12'>Payments & Fees</p>
            <div className='my-12 flex gap-8 items-center'>
                <p>Select Donation</p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex gap-8'>
                        <FormField
                            control={form.control}
                            name="selection"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger className="w-[400px]">
                                                <SelectValue placeholder="Select a donation" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectGroup>
                                                {data?.map((item: any, index: number) => {
                                                    return (
                                                        <SelectItem key={index} value={item._id} >{item.uuid}</SelectItem>
                                                    )
                                                })}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}>
                        </FormField>
                        <Button type="submit">Search</Button>
                    </form>
                </Form>
            </div>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={5}>
                    <p className='w-full text-gray-500 font-semibold'>UUID</p>
                </Grid>
                <Grid item xs={3}>
                    <p className='w-full text-gray-500 font-semibold'>Amount</p>
                </Grid>
                <Grid item xs={3}>
                    <p className='w-full text-gray-500 font-semibold'>Fees Covered</p>
                </Grid>
            </Grid>
            {loading ? (
                <>
                    <Skeleton className="w-[90%] rounded-lg">
                        <div className="h-3 w-[90%] rounded-lg bg-gray-200"></div>
                    </Skeleton>
                </>
            ) : (
                <>
                    {payments && (
                        <>
                            {payments?.map((item: any, index: number) => {
                                return (
                                    <Grid key={index} container spacing={2}>
                                        <Grid item xs={5}>
                                            <p className='w-full'>{item.uuid}</p>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <p className='w-full'>${item.amount}</p>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <p className='w-full'><span className={`px-2 py-1 ${item.is_fee_covered ? "bg-[#daffd0] text-green-500" : "bg-[#f67373] text-red-500"} rounded-lg capitalize text-xs `}>{item.is_fee_covered ? "Success" : "Fail"}</span></p>
                                        </Grid>
                                    </Grid>
                                )
                            })}
                        </>
                    )}
                </>
            )
            }
        </div >
    );
}