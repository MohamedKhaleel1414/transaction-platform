"use client"
import React, { useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import Divider from '@mui/material/Divider';
import { getOneDonation, getPayments, updateDon, refund } from './serverPage';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from "@nextui-org/react";
import moment from 'moment';
import { Button } from "@/components/ui/button";
import Grid from '@mui/material/Grid';
import { Input } from "@/components/ui/input"
import CircularProgress from '@mui/material/CircularProgress';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
    const router = useSearchParams()
    const uuid = router.get("id")
    const [data, setData] = useState<any>(null)
    const [payment, setPayment] = useState<any>(null)
    const [loading, setLoading] = React.useState<boolean>(true)
    const [reload, setReload] = React.useState<boolean>(true)

    React.useEffect(() => {
        setLoading(true)
        async function get(uuid: any) {
            let res = await getOneDonation(uuid)
            console.log(res.data);
            if (res.status === 200) {
                setData(res.data)
                if (res.data.payment_id.length) {
                    let pay = await getPayments(res.data._id)
                    console.log(pay.data)
                    setPayment(pay.data[0])
                    setLoading(false)
                }
            }
        }
        get(uuid)
    }, [reload])

    const FormSchema = z.object({
        supporter: z.string({
            required_error: "Enter supporter name",
        }).min(2, {
            message: "Supporter name must be at least 2 characters.",
        }),
        campaign: z.string({
            required_error: "Enter campaign number",
        }),
        frequency: z.string({
            required_error: "Choose frequency",
        }),
    })

    const FormSchemaOne = z.object({
        amount: z.string({
            required_error: "Enter donation amount",
        }).refine((val) => !Number.isNaN(parseInt(val, 10)), {
            message: "Expected number, received a string"
        }),
        payment_method: z.string({
            required_error: "Choose payment method",
        }),
        card_type: z.string({
            required_error: "Choose card type",
        }),
        credit_card: z.string({
            required_error: "Enter credit card",
        }).refine((val) => !Number.isNaN(parseInt(val, 10)), {
            message: "Expected number, received a string"
        }),
        payment_processor: z.string({
            required_error: "Enter payment processor",
        }),
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            supporter: data?.supporter,
            campaign: data?.campaign,
            frequency: data?.frequency,
        },
    })

    const formOne = useForm<z.infer<typeof FormSchemaOne>>({
        resolver: zodResolver(FormSchemaOne),
        defaultValues: {
            amount: "",
            payment_method: "",
            card_type: "",
            credit_card: "",
            payment_processor: "",
        },
    })

    async function onSubmit(sentData: z.infer<typeof FormSchema>) {
        let result = await updateDon(sentData, data?.uuid)
        if (result.status === 200) {
            setReload(!reload)
        }
    }

    async function onSubmitOne(sentData: z.infer<typeof FormSchemaOne>) {
        let platform_fee = 0.08
        let payment_processing_fee = 0.4
        let payout_amount = Number(sentData.amount) - platform_fee - payment_processing_fee
        let body = {
            ...sentData,
            amount: Number(sentData.amount),
            don_id: data?._id,
            payout_amount: payout_amount,
            is_fee_covered: true,
        }
        let result = await refund(body)
        if (result.status === 201) {
            setReload(!reload)
        }
    }

    function load() {
        return (
            <Skeleton className="w-[50px] rounded-lg mb-2">
                <div className="h-3 w-[90%] rounded-lg bg-gray-200"></div>
            </Skeleton>
        )
    }

    return (
        <>
            {loading ? (
                <div className='w-full text-center py-12'>
                    <CircularProgress size={75} />
                </div>
            ) : (
                <>
                    <div className="p-4">
                        <p className=" text-gray-500">Donation</p>
                        <div className='flex justify-between mb-4 items-center'>
                            <div className="flex gap-4 items-center">
                                <p className="text-3xl font-semibold">{data ? `$${payment?.amount ? payment?.amount : "0"}` : load()}</p>
                                <p className="text-3xl text-gray-500">USD</p>
                                {data ? (<p className=" px-2 py-1 bg-[#daffd0] rounded-lg capitalize text-xs text-green-500 flex items-center gap-2">succeeded <CheckIcon sx={{ fontSize: 14 }} /></p>) : load()}
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className='text-gray-500'>Refund</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader className='mb-4'>
                                        <DialogTitle>Refund Donation</DialogTitle>
                                    </DialogHeader>
                                    <Form {...formOne}>
                                        <form onSubmit={formOne.handleSubmit(onSubmitOne)}>
                                            <FormField
                                                control={formOne.control}
                                                name="amount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{"Amount ($)"}</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="2" type='number' {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            <FormField
                                                control={formOne.control}
                                                name="payment_method"
                                                render={({ field }) => (
                                                    <FormItem className='mt-4'>
                                                        <FormLabel>Select payment method</FormLabel>
                                                        <Select onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger className="">
                                                                    <SelectValue placeholder="Select a donation" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    {["Credit Card"]?.map((item: string, index: number) => {
                                                                        return (
                                                                            <SelectItem key={index} value={item} >{item}</SelectItem>
                                                                        )
                                                                    })}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            <FormField
                                                control={formOne.control}
                                                name="card_type"
                                                render={({ field }) => (
                                                    <FormItem className='mt-4'>
                                                        <FormLabel>Select card type</FormLabel>
                                                        <Select onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger className="">
                                                                    <SelectValue placeholder="Select a donation" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    {["Visa", "Master Card"]?.map((item: string, index: number) => {
                                                                        return (
                                                                            <SelectItem key={index} value={item} >{item}</SelectItem>
                                                                        )
                                                                    })}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            <FormField
                                                control={formOne.control}
                                                name="credit_card"
                                                render={({ field }) => (
                                                    <FormItem className='mt-4'>
                                                        <FormLabel>Credit card</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="4111111111111111" type='number' {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            <FormField
                                                control={formOne.control}
                                                name="payment_processor"
                                                render={({ field }) => (
                                                    <FormItem className='mt-4'>
                                                        <FormLabel>Payment processor</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="John" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            <div className='mt-8 flex justify-end'>
                                                <Button type="submit" className='bg-blue-600'>Save</Button>
                                            </div>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Divider />
                        <div className='mt-2 flex gap-6'>
                            {data ? (
                                <div className='flex justify-between w-[20%]'>
                                    <div>
                                        <p className=' text-gray-500 mb-4'>Last Update</p>
                                        <p className=''>{moment(data.don_date).format("YYYY-MM-DD")}</p>
                                    </div>
                                    <div>
                                        <Divider orientation='vertical' />
                                    </div>
                                </div>
                            ) : load()}
                            {data ? (
                                <div className='flex justify-between w-[20%]'>
                                    <div>
                                        <p className=' text-gray-500 mb-4'>Supporter</p>
                                        <p className=''>{data.supporter}</p>
                                    </div>
                                    <div>
                                        <Divider orientation='vertical' />
                                    </div>
                                </div>
                            ) : load()}
                            {data ? (
                                <div className='flex justify-between w-[20%]'>
                                    <div>
                                        <p className=' text-gray-500 mb-4'>Campaign</p>
                                        <p className=''>My Awesome Campaign {data.campaign}</p>
                                    </div>
                                    <div>
                                        <Divider orientation='vertical' />
                                    </div>
                                </div>
                            ) : load()}
                            {data ? (
                                <div className='flex justify-between w-[20%]'>
                                    <div>
                                        <p className=' text-gray-500 mb-4'>Payment Method</p>
                                        <p className=''>{payment ? payment?.payment_method : load()}</p>
                                    </div>
                                </div>
                            ) : load()}
                        </div>
                        <div className='flex justify-between mt-[100px] mb-2 items-center'>
                            <p className=' text-2xl font-semibold'>Donation Information</p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className='text-gray-500'>Edit</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader className='mb-4'>
                                        <DialogTitle>Donation Information</DialogTitle>
                                    </DialogHeader>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)}>
                                            <FormField
                                                control={form.control}
                                                name="supporter"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Supporter name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="John" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            <FormField
                                                control={form.control}
                                                name="campaign"
                                                render={({ field }) => (
                                                    <FormItem className='mt-4'>
                                                        <FormLabel>Select campaign</FormLabel>
                                                        <Select onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger className="">
                                                                    <SelectValue placeholder="Select a donation" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    {["1", "2"]?.map((item: string, index: number) => {
                                                                        return (
                                                                            <SelectItem key={index} value={item} >{item}</SelectItem>
                                                                        )
                                                                    })}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            <FormField
                                                control={form.control}
                                                name="frequency"
                                                render={({ field }) => (
                                                    <FormItem className='mt-4'>
                                                        <FormLabel>Select frequency</FormLabel>
                                                        <Select onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger className="">
                                                                    <SelectValue placeholder="Select a donation" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    {["One Time", "Monthly", "Yearly"]?.map((item: string, index: number) => {
                                                                        return (
                                                                            <SelectItem key={index} value={item} >{item}</SelectItem>
                                                                        )
                                                                    })}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            <div className='mt-8 flex justify-end'>
                                                <Button type="submit" className='bg-blue-600'>Save</Button>
                                            </div>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Divider />
                        <div className='mt-6'>
                            <Grid container spacing={2}>
                                <Grid container item spacing={2}>
                                    <Grid item sm={6} md={3}>
                                        <p className=' text-gray-500 text-sm py-1 '>Donation ID</p>
                                        <p className=' text-gray-500 text-sm py-1 '>Supporter</p>
                                        <p className=' text-gray-500 text-sm py-1 '>Campaign</p>
                                        <p className=' text-gray-500 text-sm py-1 '>Designation</p>
                                        <p className=' text-gray-500 text-sm py-1 '>Donation Date</p>
                                        <p className=' text-gray-500 text-sm py-1 '>Success Date</p>
                                        <p className=' text-gray-500 text-sm py-1 '>Frequency</p>
                                    </Grid>
                                    <Grid item sm={6} md={4}>
                                        {data ? <p className='py-1 text-sm'>{data?.uuid}</p> : <p className='py-1 text-sm'>{load()}</p>}
                                        {data ? <p className='py-1 text-sm capitalize'>{data?.supporter}</p> : <p className='py-1 text-sm'>{load()}</p>}
                                        {data ? <p className='py-1 text-sm capitalize'>My Awesome Campaign {data?.campaign}</p> : <p className='py-1 text-sm'>{load()}</p>}
                                        {data ? <p className='py-1 text-sm'>-</p> : <p className='py-1 text-sm'>{load()}</p>}
                                        {data ? <p className='py-1 text-sm'>{moment(data?.don_date).format("YYYY-MM-DD")}</p> : <p className='py-1 text-sm'>{load()}</p>}
                                        {data ? <p className='py-1 text-sm'>{moment(data?.success_date).format("YYYY-MM-DD")}</p> : <p className='py-1 text-sm'>{load()}</p>}
                                        {data ? <p className='py-1 text-sm capitalize'>{data?.frequency}</p> : <p className='py-1 text-sm'>{load()}</p>}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </div>
                        {payment &&
                            <>
                                <div className='flex justify-between mt-[100px] mb-2 items-center'>
                                    <p className=' text-2xl font-semibold'>Payment & Fees</p>
                                    {/* <Button variant="outline" className='text-gray-500'>Edit</Button> */}
                                </div>
                                <Divider />
                                <div className='mt-6'>
                                    <Grid container spacing={2}>
                                        <Grid container item spacing={2}>
                                            <Grid item sm={6} md={3}>
                                                <p className=' text-gray-500 text-sm py-1 '>Donation amount</p>
                                                <p className=' text-gray-500 text-sm py-1 '>Before fees covered</p>
                                                <p className=' text-gray-500 text-sm py-1 '>Platform fee</p>
                                                <p className=' text-gray-500 text-sm py-1 '>Payment processing fee</p>
                                                <p className=' text-gray-500 text-sm py-1 '>Payout amount</p>
                                            </Grid>
                                            <Grid item sm={6} md={3}>
                                                {payment ? <p className='py-1 text-sm'>${payment?.amount} USD</p> : <p className='py-1 text-sm'>{load()}</p>}
                                                {payment ? <p className='py-1 text-sm'>${payment?.amount} USD</p> : <p className='py-1 text-sm'>{load()}</p>}
                                                {payment ? <p className='py-1 text-sm'>${payment?.platform_fee} USD</p> : <p className='py-1 text-sm'>{load()}</p>}
                                                {payment ? <p className='py-1 text-sm'>${payment?.payment_processing_fee} USD</p> : <p className='py-1 text-sm'>{load()}</p>}
                                                {payment ? <p className='py-1 text-sm'>${payment?.payout_amount} USD</p> : <p className='py-1 text-sm'>{load()}</p>}
                                            </Grid>
                                            <Grid item sm={6} md={2}>
                                                <p className=' text-gray-500 text-sm py-1 '>Payment processor</p>
                                                <p className=' text-gray-500 text-sm py-1 '>Payment ID</p>
                                                <p className=' text-gray-500 text-sm py-1 '>Payment method</p>
                                                <p className=' text-gray-500 text-sm py-1 '>Credit card</p>
                                                <p className=' text-gray-500 text-sm py-1 '>Fee covered</p>
                                                <p className=' text-gray-500 text-sm py-1 '>Effective fee</p>
                                            </Grid>
                                            <Grid item sm={6} md={4}>
                                                {payment ? <p className='py-1 text-sm'>{payment?.payment_processor}</p> : <p className='py-1 text-sm'>{load()}</p>}
                                                {payment ? <p className='py-1 text-sm'>{payment?.uuid}</p> : <p className='py-1 text-sm'>{load()}</p>}
                                                {payment ? <p className='py-1 text-sm'>{payment?.payment_method}</p> : <p className='py-1 text-sm'>{load()}</p>}
                                                {payment ? <p className='py-1 text-sm'>{payment?.credit_card}</p> : <p className='py-1 text-sm'>{load()}</p>}
                                                {payment ? <p className='py-1 text-sm'>{payment?.is_fee_covered}</p> : <p className='py-1 text-sm'>{load()}</p>}
                                                {payment ? <p className='py-1 text-sm'>{payment?.effective_fee}</p> : <p className='py-1 text-sm'>{load()}</p>}
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </div>
                            </>
                        }
                    </div>
                </>
            )}
        </>
    )
}