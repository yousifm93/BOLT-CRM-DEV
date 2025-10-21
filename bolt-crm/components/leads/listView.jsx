'use client';

import Loading from "@/components/other/loading";
import Table from "@/components/table";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { saCreateItem, saDeleteItem, saGetItems, saUpdateItem } from "@/components/serverActions.jsx";
import { leadStages, leadStatuses } from "./helper";
import { Dropdown } from "@/components/other/dropdown";
import DateDisplay from "@/components/date/DateDisplay";
import PriorityItem from "@/components/other/priorityItem";
import StatusItem from "@/components/leads/statusItem";
import { notify } from "@/components/sonnar/sonnar";
import LeadStrength from "@/components/leads/leadStrength";
import { makeFirstLetterUppercase } from "@/utils/other";
import { applyFiltersToPrismaQuery } from "@/services/prisma";

export default function LeadListView({
    pathname, searchParams, session, user, account, stage,
}) {

    const collectionName = 'leads';
    const [_users, _setUsers] = useState([]);
    const [_data, _setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const itemStatuses = leadStatuses && leadStatuses[stage] ? leadStatuses[stage] : [];

    // console.log('LeadListView leadStatuses ==> ', leadStatuses);
    // console.log('LeadListView itemStatuses ==> ', itemStatuses);    

    const handleNewItem = async (item) => {
        let resObj = {
            success: false,
            message: 'Unknown error',
            data: null,
        }
        try {
            // console.log('New item to add (before account_id): ', item);

            // add account_id to item
            item.account_id = account ? account.id : null;
            item.stage = stage;

            const response = await saCreateItem({
                collection: collectionName,
                data: item
            });
            console.log('Response from adding new item: ', response);
            if (response && response.success) {
                _setData(prev => [...prev, response.data]);
                // notify({ type: 'success', message: 'New item added successfully' });
                resObj.success = true;
                resObj.data = response.data;
                resObj.message = 'Done';
            } else {
                resObj.success = false;
                resObj.message = response.message || 'Failed to add new item';
                notify({ type: 'error', message: response.message || 'Failed to add new item' });
            }


            return resObj;
        } catch (error) {
            console.error('Error adding new item: ', error);
            notify({ type: 'error', message: 'Failed to add new item' });
            resObj.success = false;
            resObj.message = error.message || 'Failed to add new item';
            return resObj;
        }
    };
    const handleUpdateItem = async (item) => {
        let resObj = {
            success: false,
            message: 'Unknown error',
            data: null,
        }
        try {
            const updatedItem = { ...item };
            // make date ISO 8601
            updatedItem.due_date = updatedItem.due_date ? new Date(updatedItem.due_date).toISOString() : null;
            const response = await saUpdateItem({
                collection: collectionName,
                query: {
                    where: { id: item.id },
                    data: updatedItem
                }
            });
            console.log('Response from updating item: ', response);

            if (response && response.success) {
                _setData(prev => prev.map(i => i.id === item.id ? response.data : i));
                // notify({ type: 'success', message: 'Item updated successfully' });
                resObj.success = true;
                resObj.data = response.data;
                resObj.message = 'Done';
            } else {
                notify({ type: 'error', message: response.message || 'Failed to update item' });
                resObj.message = response.message || 'Failed to update item';
                resObj.success = false;
            }

            return resObj;

        } catch (error) {
            console.error('Error deleting item: ', error);
            notify({ type: 'error', message: 'Failed to delete item' });
            resObj.message = error.message || 'Failed to delete item';
            resObj.data = item;
            resObj.success = false;
            return resObj;
        }
    };
    const handleDeleteItem = async (item) => {
        let resObj = {
            success: false,
            message: 'Unknown error',
            data: null,
        }
        try {
            const response = await saDeleteItem({
                collection: collectionName,
                query: {
                    where: { id: item.id }
                }
            });
            if (response && response.success) {
                _setData(prev => prev.filter(i => i.id !== item.id));
                // notify({ type: 'success', message: 'Item deleted successfully' });
                resObj.success = true;
                resObj.message = 'Done';
            } else {
                notify({ type: 'error', message: response.message || 'Failed to delete item' });
                resObj.message = response.message || 'Failed to delete item';
                resObj.success = false;
            }

            return resObj;
        } catch (error) {
            console.error('Error deleting item: ', error);
            notify({ type: 'error', message: 'Failed to delete item' });
            resObj.message = error.message || 'Failed to delete item';
            resObj.data = item;
            resObj.success = false;
            return resObj;
        }
    };


    // filters
    const handleFilterChange = async (filters) => {
        try {

            // console.log('filters: ',filters);
            // return

            // console.log('Tasks filters: ', filters);

            // apply filters to reqData.query.where
            const reqQuery = applyFiltersToPrismaQuery({
                query: {
                    where: {
                        account_id: account ? account.id : null
                    },
                },
                filters
            });
            // console.log('handleFilterChange reqQuery: ', reqQuery);

            setIsLoading(true);
            const response = await saGetItems({
                collection: collectionName,
                query: reqQuery
            });
            // console.log('response: ', response);


            if (response && response.success) {
                _setData(response.data || []);
            } else {
                notify({ type: 'error', message: response.message || 'Failed to fetch filtered tasks' });
            }


        } catch (error) {
            console.error('Error fetching filtered tasks: ', error);
            notify({ type: 'error', message: 'Failed to fetch filtered tasks' });
            resObj.message = error.message || 'An error occurred';
            resObj.warning = true;
        } finally {
            setIsLoading(false);
        }
    }





    // initial load, fetch data
    useEffect(() => {
        const body = async () => {
            try {

                setIsLoading(true);
                const response = await saGetItems({
                    collection: collectionName,
                    query: {
                        where: {
                            account_id: account ? account.id : null,
                            stage: stage
                        },
                    }
                });

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

                // console.log('Fetched tasks: ', response);
                // console.log('Fetched users: ', users);

                if (response && response.success) {
                    _setData(response.data || []);
                    _setUsers(users && users.success && users.data ? users.data : []);
                } else {
                    notify({ type: 'error', message: response.message || 'Failed to fetch tasks' });
                }


            } catch (error) {
                console.error('Error fetching tasks: ', error);
            } finally {
                setIsLoading(false);
            }
        };
        body();
    }, []);



    const baseColumns = [
        { key: 'id', title: 'ID', width: 'w-12', },
        { key: 'title', title: 'Title', width: 'w-32', required: true, },
        { key: 'name', title: 'Name', width: 'w-12', },
        { key: 'first_name', title: 'First Name', width: 'w-28', required: true, },
        { key: 'last_name', title: 'Last Name', width: 'w-28', required: true, },
        { key: 'company', title: 'Company', width: 'w-24', },
        { key: 'email', title: 'Email', width: 'w-24', required: true, },
        { key: 'phone', title: 'Phone', width: 'w-24', required: true, },
        {
            key: 'created_at', title: 'Created At', width: 'w-28',
            disabled: true,
            type: 'date',
            required: true,
            defaultValue: (new Date()).toISOString(), Component: ({ value }) => {
                return <DateDisplay date={value} />;
            },
        },
        { key: 'referred_via', title: 'Referred Via', width: 'w-34', required: true, defaultValue: 'email', },
        { key: 'referral_source', title: 'Referral Source', width: 'w-34', required: true, defaultValue: 'agent', },
        {
            key: 'lead_strength', title: 'Lead Strength', width: 'w-34', required: false,
            type: 'select',
            options: ['low', 'medium', 'high'],
            defaultValue: 'low',
            Component: ({ value }) => {
                return <LeadStrength priority={value.toLowerCase()}>
                    {value}
                </LeadStrength>;
            },
            EditComponent: ({ value, onChange }) => (
                <div className="">
                    <Dropdown fixed={true}>
                        <div data-type="trigger" className="w-full cursor-pointer appearance-none border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                            {value || 'Select priority'}
                        </div>
                        <div data-type="content" className="p-2">
                            {['Low', 'Medium', 'High'].map(option => (
                                <div key={option} className="cursor-pointer p-1 hover:scale-105 duration-200" onClick={() => onChange(option)}>
                                    <LeadStrength priority={option.toLowerCase()}>
                                        {option}
                                    </LeadStrength>
                                </div>
                            ))}
                        </div>
                    </Dropdown>
                </div>
            ),
        },
        { key: 'due_date', title: 'Due Date', width: 'w-32', type: 'date', required: true },
        {
            key: 'status', title: 'Status', width: 'w-28', required: true,
            type: 'select',
            // options: itemStatuses.map(i => i.name),
            options: itemStatuses,
            defaultValue: 'Not Started',
            Component: ({ value }) => {
                // console.log('Status Component value ==> ', value);
                return <StatusItem status={value} className='min-w-14'> {value}  </StatusItem>
            },
            EditComponent: ({ value, onChange }) => {
                // console.log('EditComponent value ==> ', value);

                const fromList = itemStatuses.find(sts => sts.name === value);

                return (
                    <div className="">
                        <Dropdown fixed={true}>
                            <div data-type={'trigger'} className="w-full cursor-pointer appearance-none border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                                <StatusItem status={value} > {value}  </StatusItem>
                            </div>
                            <div data-type="content" className="flex flex-col gap-1 p-2">
                                {itemStatuses.map((sts, index) => (
                                    <button key={sts.name + index} onClick={() => onChange(sts.name)} className="w-full hover:scale-105 duration-200">
                                        <StatusItem status={sts} />
                                    </button>
                                ))}
                            </div>
                        </Dropdown>
                    </div>
                )
            },
        },
        { key: 'property_type', title: 'Property Type', width: 'w-24', required: true, },
        { key: 'loan_program', title: 'Loan Program', width: 'w-24', required: true, },
        { key: 'description', title: 'Description', type: 'textarea', width: 'w-64', required: false, },
        { key: 'notesArray', title: 'Notes', width: 'w-64', type: 'notesArray', required: false, },
    ]
    // columns
    let thisColumns = [];
    let editRenderOrder = []
    let tableExcludeKeys = []
    if (stage) {
        // if (stage === 'lead') {
        // }
        thisColumns = [
            { ...baseColumns.find(c => c.key === 'first_name') },
            { ...baseColumns.find(c => c.key === 'last_name') },
            { ...baseColumns.find(c => c.key === 'created_at') },
            { ...baseColumns.find(c => c.key === 'status'), defaultValue: 'new' },
            { ...baseColumns.find(c => c.key === 'referred_via') },
            { ...baseColumns.find(c => c.key === 'referral_source') },
            { ...baseColumns.find(c => c.key === 'lead_strength') },
            { ...baseColumns.find(c => c.key === 'due_date') },
            { ...baseColumns.find(c => c.key === 'description') },
        ]
        editRenderOrder = [
            ['created_at', 'due_date'],
            ['status', 'lead_strength'],
            ['first_name', 'last_name'],
            ['referred_via', 'referral_source'],
            ['email', 'phone'],
            ['description']
        ]
        tableExcludeKeys = ['description']
    }

    // console.log('LeadListView thisColumns ==> ', thisColumns);


    if (!stage) {
        return null;
    }



    return (
        <div className="container-main flex flex-col gap-4 w-full">
            <h1 className="text-2xl flex items-center gap-1 capitalize">
                Pipeline
                <ChevronRight className="size-4 mt-1 text-gray-500" />
                {makeFirstLetterUppercase(stage)}
            </h1>

            <div className="w-full relative rounded-md overflow-x-auto">
                <Table
                    account={account}
                    user={user}
                    className="card-1 min-w-full "
                    editable={true}
                    editableInline={true}
                    allowAddNew={true}
                    actions={['view', 'delete']}
                    linkPrefix={`${pathname}`}
                    editRenderOrder={editRenderOrder}
                    tableExcludeKeys={tableExcludeKeys}
                    columns={thisColumns || []}
                    data={_data}
                    onAddNew={handleNewItem}
                    onRowChange={handleUpdateItem}
                    onRowDelete={handleDeleteItem}
                    onChange={(newData) => {
                        console.log('Table data changed: ', newData);

                    }}
                    filterable={true}
                    onFilter={handleFilterChange}
                />
                <Loading loading={isLoading} />
            </div>
        </div>
    );
}