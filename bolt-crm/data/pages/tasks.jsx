'use client';
import { Dropdown } from "@/components/other/dropdown";
import Loading from "@/components/other/loading";
import StatusItem from "@/components/other/taskStatusItem";
import DateDisplay from "@/components/date/DateDisplay";
import { saCreateItem, saDeleteItem, saGetItems, saUpdateItem } from "@/components/serverActions.jsx";
import { notify } from "@/components/sonnar/sonnar";
import Table from "@/components/table";
import { useState, useEffect } from "react";
import PriorityItem from "@/components/other/priorityItem";
import { Check, CircleAlert, Clock, Tag, Users } from "lucide-react";
import { makeFirstLetterUppercase, toDisplayStr } from "@/utils/other";
import { taskPriorities, taskStatuses } from "@/components/leads/helper";
import { applyFiltersToPrismaQuery } from "@/services/prisma";

export default function Tasks({ pathname, account, user, session }) {

    const collectionName = 'tasks';
    const [isLoading, setIsLoading] = useState(true);
    const [_data, _setData] = useState([]);
    const [_users, _setUsers] = useState([]); // all users for assigned_users field
    const [_leads, _setLeads] = useState([]); // all leads for lead_id field


    const handleNewItem = async (item) => {
        let resObj = {
            success: false,
            message: 'Unknown error',
            data: null,
        }
        try {
            // console.log('New item to add (before account_id): ', item);

            let toSaveItem = { ...item };

            // add account_id to item
            toSaveItem.account_id = account ? account.id : null;
            toSaveItem.creator_id = user ? user.id : null;
            // make date ISO 8601
            toSaveItem.due_date = toSaveItem.due_date ? new Date(toSaveItem.due_date).toISOString() : null;

            // relationship fields
            // delete lead_id if empty string
            if (toSaveItem.lead_id === '') {
                delete toSaveItem.lead_id;
            }
            if (!toSaveItem.creator_id) {
                toSaveItem.creator_id = user?.id;
            }
            // console.log('New item to add (after account_id): ', toSaveItem);

            const response = await saCreateItem({
                collection: collectionName,
                data: toSaveItem
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


    const handleGetData = async () => {
        let resObj = {
            success: false,
            warning: false,
            message: '',
            data: null,
        }
        try {
            const response = await saGetItems({
                collection: collectionName,
                query: {
                    where: {
                        account_id: account ? account.id : null
                    },
                }
            });
            if (response && response.success) {
                resObj.success = true;
                resObj.data = response.data;
            } else {
                resObj.message = response.message || 'Failed to fetch data';
            }
        } catch (error) {
            console.error(error);
            resObj.message = error.message || 'An error occurred';
            resObj.warning = true;
        }
    }


    const handleFilterChange = async (filters) => {
        try {
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
                            account_id: account ? account.id : null
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

                if (response && response.success) {
                    _setData(response.data || []);
                    _setUsers(users && users.success && users.data ? users.data : []);
                    _setLeads(leads && leads.success && leads.data ? leads.data : []);
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

    // console.log('isLoading, _data ==> ', isLoading, _data);

    const getTasksByStatus = (tasks, status) => {
        try {
            if (!tasks || !Array.isArray(tasks)) return [];

            const result = [];
            if (status === 'active') {
                tasks.forEach(task => {
                    if (['inProgress', 'notStarted', 'onHold'].includes(task.status)) {
                        result.push(task);
                    }
                });
            } else if (status === 'completed' || status === 'done') {
                tasks.forEach(task => {
                    if (['Completed', 'Done'].includes(task.status)) {
                        result.push(task);
                    }
                });
            } else if (status === 'overdue') {
                const now = new Date();
                tasks.forEach(task => {
                    if (task.status === status && new Date(task.due_date) < now) {
                        result.push(task);
                    }
                });
            }
            return result;
        } catch (error) {
            return [];
        }
    };




    const tableColumns = [
        // { key: 'id', title: 'ID', width: 'w-12', },
        { key: 'title', title: 'Title', width: 'w-32', required: true, },
        {
            key: 'priority', title: 'Priority', width: 'w-32',
            required: true, type: 'select',
            options: taskPriorities,
            defaultValue: 'medium',
            Component: ({ value }) => {
                return <PriorityItem priority={value.toLowerCase()}>
                    {toDisplayStr(value)}
                </PriorityItem>;
            },
            EditComponent: ({ value, onChange }) => (
                <div className="">
                    <Dropdown fixed={true}>
                        <div data-type="trigger" className="w-full cursor-pointer appearance-none border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                            {value || 'Select priority'}
                        </div>
                        <div data-type="content" className="p-2">
                            {taskPriorities.map(option => (
                                <div
                                    key={option.name} className="cursor-pointer p-1 hover:scale-105 duration-200"
                                    onClick={() => onChange(option.name)}
                                >
                                    <PriorityItem priority={option.name.toLowerCase()}>
                                        {toDisplayStr(option.label)}
                                    </PriorityItem>
                                </div>
                            ))}
                        </div>
                    </Dropdown>
                </div>
            ),
        },
        {
            key: 'assigned_users',
            title: 'Assigned Users', width: 'w-40', required: true,
            type: 'select',
            multiple: true,
            options: [..._users.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}` }))],
            Component: ({ value, users, leads }) => {

                const thisUsers = users.filter(u => value.includes(u.id));

                if (thisUsers.length === 0) {
                    return <div className="flex gap-2 items-center text-red-300">
                        <Users className="size-4" />
                        <span className="text-xs">No users</span>
                    </div>
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {thisUsers.map(user => (
                            <div key={user.id} className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center">
                                {user.first_name.slice(0, 1).toUpperCase()}
                            </div>
                        ))}
                    </div>
                );
            },
            EditComponent: ({ value, onChange, users, leads }) => {
                console.log('EditComponent value', value);

                const thisUsers = users.filter(u => value.includes(u.id));
                const options = users.filter(u => !value.includes(u.id));

                return (
                    <div className="">
                        <Dropdown fixed={true} className="">
                            <div data-type="trigger" className="flex flex-wrap gap-1">
                                {thisUsers.map(user => (
                                    <div key={user.id} className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center">
                                        {user.first_name.slice(0, 1).toUpperCase()}
                                    </div>
                                ))}
                                {
                                    thisUsers.length === 0 &&
                                    <div className="text-gray-500">
                                        Select users
                                    </div>
                                }
                            </div>
                            <div data-type="content" className="p-2">
                                {options.map(user => (
                                    <div key={user.id} className="cursor-pointer p-1 hover:bg-gray-100" onClick={() => onChange(user.id)}>
                                        {user.first_name} {user.last_name}
                                    </div>
                                ))}
                            </div>
                        </Dropdown>
                    </div>
                )
            },
        },
        {
            key: 'due_date',
            title: 'Due Date',
            width: 'w-36',
            required: true,
            type: 'date',
            clearable: true,
            placeholder: 'Select due date...',
            // Component: ({value}) => {
            //     return (
            //         <DateDisplay 
            //             date={value} 
            //             format="short"
            //             className="text-gray-700"
            //         />
            //     );
            // },
        },
        {
            key: 'status', title: 'Status', width: 'w-32', required: true,
            type: 'select',
            options: taskStatuses,
            defaultValue: 'notStarted',
            Component: ({ value }) => {
                // console.log('value', value);
                let val = 'notStarted'
                const fromList = taskStatuses.find(s => s.name === value);
                if (fromList) {
                    val = fromList.name;
                }

                return <StatusItem status={fromList ? fromList.name : 'notStarted'} >
                    <span> {toDisplayStr(val)}</span>
                </StatusItem>
            },
            EditComponent: ({ value, onChange }) => (

                <div className="">
                    <Dropdown fixed={true}>
                        <div data-type={'trigger'} className="w-full cursor-pointer appearance-none border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                            {value?.label || value.name || 'Select status'}
                        </div>
                        <div data-type="content" className="flex flex-col gap-1 p-2">
                            {taskStatuses.map((status, index) => (
                                <button
                                    key={'status-task-' + status.name + index}
                                    onClick={() => onChange(status?.name || 'notStarted')}
                                    className="w-full hover:scale-105 duration-200"
                                >
                                    <StatusItem status={status.name}>
                                        <span>{status.label || status.name}</span>
                                    </StatusItem>
                                </button>
                            ))}
                        </div>
                    </Dropdown>
                </div>
            ),
        },
        {
            key: 'lead_id', title: 'Lead', width: 'w-32',
            required: false,
            type: 'select',
            options: _leads.map(lead => ({ value: lead.id, label: `${lead.first_name} ${lead.last_name}` })),
            defaultValue: '',
            Component: ({ value, leads }) => {
                // console.log('value', value);
                let displayValue = '';
                const lead = leads.find(l => l.id === value);
                if (lead) {
                    displayValue = `${lead.first_name} ${lead.last_name}`;
                }

                return (
                    <div className="min-w-14 flex items-center">
                        <Tag className="size-4 mr-1" />
                        {displayValue ? displayValue : <span className="text-gray-500">No lead</span>}
                    </div>
                )
            },
            EditComponent: ({ value, onChange, leads }) => {
                let displayValue = '';
                const lead = leads.find(l => l.id === value);
                if (lead) {
                    displayValue = `${lead.first_name} ${lead.last_name}`;
                }
                return (
                    <div className="">
                        <Dropdown fixed={true}>
                            <div data-type={'trigger'} className="w-full cursor-pointer appearance-none border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                                {displayValue || 'Select lead'}
                            </div>
                            <div data-type="content" className="flex flex-col gap-2 p-2">
                                {leads.map(lead => (
                                    <button key={lead.id} onClick={() => onChange(lead.id)} className="w-full hover:scale-105 duration-200">
                                        {`${lead.first_name || 'n/'} ${lead.last_name || 'a'}`}
                                    </button>
                                ))}
                            </div>
                        </Dropdown>
                    </div>
                )
            },
        },
        { key: 'description', title: 'Description', width: 'w-36', type: 'textarea', disabled: false, },
        // {
        //     key: 'email', title: 'Email', width: 'w-60', required: true,
        //     Component: ({value}) => <div className="lowercase bg-red-500">{value}</div>
        // },
    ]


    // console.log('_data: ', _data);
    // console.log('_users: ', _users);

    return (
        <div className="container-main w-full flex flex-col gap-6">
            <h1 className="text-2xl">Tasks</h1>

            {/* custom statuses */}
            <div className="w-full flex flex-wrap gap-4 ">
                {
                    ['active', 'overdue', 'completed'].map(status => {
                        const thisTasks = getTasksByStatus(_data, status);
                        return (
                            <div className="card-1 flex flex-1 h-20 relative" key={status}>
                                <div className="w-full h-full flex">
                                    <div className="w-full">
                                        <div className="">
                                            <span className="text-2xl font-semibold">
                                                {thisTasks ? thisTasks.length : 0}
                                            </span>
                                        </div>
                                        <div className="">{makeFirstLetterUppercase(status)}</div>
                                    </div>
                                    <div className="w-12 opacity-70">
                                        {status === 'active' && <Clock className="w-8 h-8 text-yellow-400" />}
                                        {status === 'overdue' && <CircleAlert className="w-8 h-8 text-red-400" />}
                                        {status === 'completed' && <Check className="w-8 h-8 text-green-400" />}
                                    </div>

                                </div>

                                <Loading loading={isLoading} />
                            </div>
                        )
                    })
                }
            </div>
            {/* predefined statuses */}
            <div className="w-full flex flex-wrap gap-4 ">
                {
                    taskStatuses.map(status => {
                        // const thisTasks = getTasksByStatus(_data, status);
                        const thisTasks = _data.filter(t => {
                            if (status.name === t.status) return true;
                        });

                        const label = toDisplayStr(status.name);
                        const s = status.name.toLowerCase();

                        return (
                            <div className="card-1 flex flex-1 h-20 relative" key={s}>
                                <div className="w-full h-full flex">
                                    <div className="w-full">
                                        <div className="">
                                            <span className="text-2xl font-semibold">
                                                {thisTasks ? thisTasks.length : 0}
                                            </span>
                                        </div>
                                        <div className="">{label}</div>
                                    </div>
                                </div>
                                <Loading loading={isLoading} />
                            </div>
                        )
                    })
                }
            </div>

            <div className="w-full relative rounded-md overflow-x-auto">
                <Table
                    account={account}
                    user={user}
                    pathname={pathname}
                    className="card-1 min-w-full "
                    editable={true}
                    editableInline={true}
                    allowAddNew={true}
                    actions={['edit', 'delete']}
                    editRenderOrder={[
                        ['title', 'priority'],
                        ['status', 'due_date'],
                        ['assigned_users'],
                        ['lead_id'],
                        ['description']
                    ]}
                    tableExcludeKeys={['description']}
                    columns={tableColumns}
                    users={_users}
                    leads={_leads}
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