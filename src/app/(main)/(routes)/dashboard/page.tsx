import { redirect } from 'next/navigation'
import React from 'react'

const Page = () => {
    return redirect("/dashboard/new-space")
}

export default Page