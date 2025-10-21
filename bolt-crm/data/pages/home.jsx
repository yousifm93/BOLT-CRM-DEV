'use client';

import Loading from "@/components/other/loading";
import { saGetItems } from "@/components/serverActions.jsx";
import { notify } from "@/components/sonnar/sonnar";
import { Activity, Calendar, ChartArea, File, FileText, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";


export default function Home({ params, pathname, searchParams, session, user, account }) {


    const [isLoading, setIsLoading] = useState(false);
    const [_data, _setData] = useState([]);
    const [_users, _setUsers] = useState([]);
    const [_leads, _setLeads] = useState([]);


    const leadBoxes = [
        {
            name: 'thisMonthLeads',
            label: 'This Month Leads',
            Icon: ({ className }) => <Calendar className={className} />,
            func: (leads) => {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                const arr = leads.filter(lead => {
                    const leadDate = new Date(lead.created_at);
                    return leadDate >= startOfMonth && leadDate <= endOfMonth;
                });
                return arr;
            }
        },
        {
            name: 'yesterdayLeads',
            label: 'Yesterday Leads',
            Icon: ({ className }) => <TrendingUp className={className} />,
            func: (leads) => {
                const now = new Date();
                const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const arr = leads.filter(lead => {
                    const leadDate = new Date(lead.created_at);
                    return leadDate >= startOfYesterday && leadDate < endOfYesterday;
                });
                return arr;
            }
        },
        {
            name: 'thisMonthApps',
            label: 'This Month\'s Apps',
            Icon: ({ className }) => <FileText className={className} />,
            func: (leads) => {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                const arr = leads.filter(lead => {
                    const leadDate = new Date(lead.created_at);
                    const dateOk = leadDate >= startOfMonth && leadDate <= endOfMonth;
                    const stageOk = lead.stage === 'pendingApp';
                    return dateOk && stageOk;
                });
                return arr;
            }
        },
        {
            name: 'yesterdayApps',
            label: 'Yesterday\'s Apps',
            Icon: ({ className }) => <Activity className={className} />,
            func: (leads) => {
                const now = new Date();
                const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const arr = leads.filter(lead => {
                    const leadDate = new Date(lead.created_at);
                    return leadDate >= startOfYesterday && leadDate < endOfYesterday;
                });
                return arr;
            }
        }
    ]


    // initial load, fetch data
    useEffect(() => {
        const body = async () => {
            try {

                setIsLoading(true);


                const users = await saGetItems({
                    collection: 'users',
                    query: {
                        where: {
                            users_and_accounts: {
                                some: {
                                    account_id: account.id, // or your accountId variable
                                },
                            },
                        },
                        include: {
                            users_and_accounts: {
                                include: {
                                    account: true,
                                },
                            },
                        },
                    }
                });


                // fetch leads for lead_id field
                const leads = await saGetItems({
                    collection: 'leads',
                    query: {
                        where: {
                            account_id: account ? account.id : null
                        },
                    }
                });

                // console.log('Fetched tasks: ', response);
                // console.log('Fetched users: ', users);
                // console.log('leads: ', leads);

                _setUsers(users && users.success && users.data ? users.data : []);
                _setLeads(leads && leads.success && leads.data ? leads.data : []);

                // if (response && response.success) {
                // } else {
                //     notify({ type: 'error', message: response.message || 'Failed to fetch tasks' });
                // }


            } catch (error) {
                console.error('Error fetching tasks: ', error);
            } finally {
                setIsLoading(false);
            }
        };
        body();
    }, []);


    // console.log('_data', _data);
    // console.log('_users', _users);
    // console.log('_leads', _leads);

    return (
        <div className="container-main flex flex-col gap-4">
            <h1 className="text-2xl">Homepage</h1>
            {/* cards */}
            <div className="w-full">
                {/* leadBoxes */}
                <div className="flex flex-wrap gap-5 justify-between">
                    {leadBoxes && leadBoxes.map((box, index) => {
                        const boxLeads = box.func(_leads);
                        return (
                            <div key={'lead-box-' + index} className="card-2 flex-1 max-w-96 h-32 relative flex flex-col gap-2 hover:scale-[100.3%] duration-200">
                                <div className="flex flex-row items-center justify-between">
                                    <p className="text-2xl text-gray-600">{box.label}</p>
                                    <box.Icon className="size-7 opacity-70 text-yellow-400" />
                                </div>
                                <div>
                                    <span className="text-3xl">
                                        {box.func
                                            ? box.func(boxLeads).length
                                            : 0}
                                    </span>
                                </div>

                                <Loading loading={isLoading} />
                            </div>
                        );
                    })
                    }
                </div>

            </div>

            <div className="w-full card-2 relative ">
                <div className="flex-1 flex gap-5 p-10 opacity-40 flex-col items-center justify-center text-gray-400 select-none">
                    {'Reporting Coming Soon'}

                    <Image
                        src="/images/other/fc3noor2.svg"
                        alt="chart"
                        width={600}
                        height={200}
                        className=""
                    />

                </div>
                <Loading loading={isLoading} />
            </div>

            <div className="w-full card-2 relative">
                <div className="flex-1 flex gap-5 p-10 opacity-40 flex-col items-center justify-center text-gray-400 select-none">
                    {'Reporting Coming Soon'}

                    <Image
                        src="/images/other/fc3noor2_bars.svg"
                        alt="chart"
                        width={600}
                        height={200}
                        className=""
                    />

                </div>
                <Loading loading={isLoading} />
            </div>
        </div>
    );
}