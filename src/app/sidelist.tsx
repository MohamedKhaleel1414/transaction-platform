"use client"
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import React from "react";
import { useRouter } from 'next/navigation';

export default function SideList() {
    const router = useRouter()
    const list = [{ name: "Donation", route: "donation" }, { name: "Payment & Fees", route: "payment" }]
    const [value, setValue] = React.useState<Number>(0)
    return (
        <div className=" bg-gray-100 w-[20%]">
            <Tabs orientation="vertical" sx={{ my: 4, px: 1 }}>
                {list.map((item, index) => {
                    return (
                        <Tab key={index} label={(
                            <p className="w-full text-start px-2">{item.name}</p>
                        )} className={`rounded-lg ${value === index ? " bg-[#e6f2ff]" : "bg-gray-100"} mb-2`}
                            onClick={() => {
                                setValue(index)
                                router.push(`/${item.route}`)
                            }}
                        />
                    )
                })}
            </Tabs>
        </div>
    )
}