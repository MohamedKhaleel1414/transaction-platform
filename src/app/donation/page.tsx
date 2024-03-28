"use client"
import React from 'react';
import IconButton from '@mui/material/IconButton';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
import { getDonations } from './serverPage';
import { Skeleton } from "@nextui-org/react";

export default function Home() {
  const [data, setData] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
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

  return (
    <div className="p-4 mt-12">
      <p className=' text-3xl font-semibold mb-12'>Donations</p>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={5}>
          <p className='w-full text-gray-500 font-semibold'>UUID</p>
        </Grid>
        <Grid item xs={3}>
          <p className='w-full text-gray-500 font-semibold'>Supporter</p>
        </Grid>
        <Grid item xs={3}>
          <p className='w-full text-gray-500 font-semibold'>Campaign</p>
        </Grid>
        <Grid item xs={1}>
          <p className='w-full text-gray-500 font-semibold'>View</p>
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
          {data?.map((item: any, index: number) => {
            return (
              <Grid key={index} container spacing={2}>
                <Grid item xs={5}>
                  <p className='w-full'>{item.uuid}</p>
                </Grid>
                <Grid item xs={3}>
                  <p className='w-full'>{item.supporter}</p>
                </Grid>
                <Grid item xs={3}>
                  <p className='w-full'>{item.campaign}</p>
                </Grid>
                <Grid item xs={1}>
                  <IconButton sx={{ color: "green" }}
                    onClick={() => {router.push(`/donation/onedonation?id=${item.uuid}`)}}
                  >
                    <ViewAgendaIcon />
                  </IconButton>
                </Grid>
              </Grid>
            )
          })}
        </>
      )
      }
    </div >
  );
}