"use client"
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'

const Page = () => {
  const router = useRouter()
  return (
    <div className='flex flex-col w-full h-full   items-center justify-center'>
      <Button onClick={() => router.push("/dashboard")} className='text-white bg-black rounded-[10px] shadow-black shadow-sm'>
        Go to Dashboard
      </Button>
      <span className='my-2 text-sm text-gray-500'>Let's do some work</span>
    </div>
  )
}

export default Page