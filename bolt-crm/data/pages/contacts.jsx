'use client';
import { Dropdown } from "@/components/other/dropdown";
import Loading from "@/components/other/loading";
import DateDisplay from "@/components/date/DateDisplay";
import { saCreateItem, saDeleteItem, saGetItems, saUpdateItem } from "@/components/serverActions.jsx";
import { notify } from "@/components/sonnar/sonnar";
import Table from "@/components/table";
import { useState, useEffect } from "react";
import { Users, Mail, Phone, Building2 } from "lucide-react";
import { makeFirstLetterUppercase, toDisplayStr } from "@/utils/other";
import StatusItem from "@/components/other/generalStatusItem";
import { contactTypes } from "@/data/contactTypes";

export default function Contacts({ pathname, user, account, session }) {

    const collectionName = 'contacts';
    const [isLoading, setIsLoading] = useState(true);
    const [_originalData, _setOriginalData] = useState([]);
    const [_data, _setData] = useState([]);
    const [filterType, setFilterType] = useState(null); // all, borrower, lead, customer

    const contactStatuses = ['active', 'inactive', 'archived'];

    const handleNewItem = async (item) => {
        let resObj = {
            success: false,
            message: 'Unknown error',
            data: null,
        }
        try {
            // add account_id to item
            item.account_id = account ? account.id : null;

            const response = await saCreateItem({
                collection: collectionName,
                data: item
            });
            console.log('Response from adding new contact: ', response);
            if (response && response.success) {
                _setData(prev => [...prev, response.data]);
                resObj.success = true;
                resObj.data = response.data;
                resObj.message = 'Done';
            } else {
                resObj.success = false;
                resObj.message = response.message || 'Failed to add new contact';
                notify({ type: 'error', message: response.message || 'Failed to add new contact' });
            }

            return resObj;
        } catch (error) {
            console.error('Error adding new contact: ', error);
            notify({ type: 'error', message: 'Failed to add new contact' });
            resObj.success = false;
            resObj.message = error.message || 'Failed to add new contact';
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
            const response = await saUpdateItem({
                collection: collectionName,
                query: {
                    where: { id: item.id },
                    data: item
                }
            });
            console.log('Response from updating contact: ', response);

            if (response && response.success) {
                _setData(prev => prev.map(i => i.id === item.id ? response.data : i));
                resObj.success = true;
                resObj.data = response.data;
                resObj.message = 'Done';
            } else {
                notify({ type: 'error', message: response.message || 'Failed to update contact' });
                resObj.message = response.message || 'Failed to update contact';
                resObj.success = false;
            }

            return resObj;

        } catch (error) {
            console.error('Error updating contact: ', error);
            notify({ type: 'error', message: 'Failed to update contact' });
            resObj.message = error.message || 'Failed to update contact';
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
                resObj.success = true;
                resObj.message = 'Done';
            } else {
                notify({ type: 'error', message: response.message || 'Failed to delete contact' });
                resObj.message = response.message || 'Failed to delete contact';
                resObj.success = false;
            }

            return resObj;
        } catch (error) {
            console.error('Error deleting contact: ', error);
            notify({ type: 'error', message: 'Failed to delete contact' });
            resObj.message = error.message || 'Failed to delete contact';
            resObj.data = item;
            resObj.success = false;
            return resObj;
        }
    };

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

                console.log('Fetched contacts: ', response);

                if (response && response.success) {
                    _setData(response.data || []);
                    _setOriginalData(response.data || []);
                } else {
                    notify({ type: 'error', message: response.message || 'Failed to fetch contacts' });
                }

            } catch (error) {
                console.error('Error fetching contacts: ', error);
            } finally {
                setIsLoading(false);
            }
        };
        body();
    }, []);

    const getContactsByStatus = (contacts, status) => {
        try {
            if (!contacts || !Array.isArray(contacts)) return [];
            return contacts.filter(contact => contact.status === status);
        } catch (error) {
            return [];
        }
    };

    const getContactsByType = (contacts, type) => {
        try {
            if (!contacts || !Array.isArray(contacts)) return [];
            return contacts.filter(contact => contact.type === type);
        } catch (error) {
            return [];
        }
    };

    const handleContactTypeChange = (type) => {
        // console.log('Contact type clicked: ', type);
        // filter _data by type
        if (type === filterType || type === 'all' || !type) {
            _setData(_originalData);
            setFilterType(null);
        } else {
            const filtered = getContactsByType(_originalData, type);
            _setData(filtered);
            setFilterType(type);
        }
    };

    

    // return (
    //     <div className="container-main w-full flex flex-col gap-6">
    //         <h1 className="text-2xl">Contacts</h1>
    //         <div className="w-full h-20 bg-red-200">
    //         </div>
    //     </div>
    // )

    // max-w-[calc(100%-var(--sidebar-width))]

    return (
        <div className="container-main flex flex-col gap-6 relative ">
            <h1 className="text-2xl">Contacts</h1>


            {/* Contact Status Cards */}
            <div className="w-full flex flex-wrap gap-4">
                {
                    contactStatuses.map(status => {
                        const thisContacts = getContactsByStatus(_data, status);
                        return (
                            <div className="card-1 flex flex-1 h-20 relative" key={status}>
                                <div className="w-full h-full flex">
                                    <div className="w-full">
                                        <div className="">
                                            <span className="text-2xl font-semibold">
                                                {thisContacts ? thisContacts.length : 0}
                                            </span>
                                        </div>
                                        <div className="">{makeFirstLetterUppercase(status)}</div>
                                    </div>
                                    <div className="w-12 opacity-70">
                                        {status === 'active' && <Users className="w-8 h-8 text-green-400" />}
                                        {status === 'inactive' && <Users className="w-8 h-8 text-gray-400" />}
                                        {status === 'archived' && <Users className="w-8 h-8 text-red-400" />}
                                    </div>
                                </div>
                                <Loading loading={isLoading} />
                            </div>
                        )
                    })
                }
            </div>

            {/* Contact Type Cards */}
            <div className="w-full flex flex-wrap gap-3 justify-start">
                {
                    contactTypes.map(type => {
                        const thisContacts = getContactsByType(_data, type);
                        const isSelected = type === filterType;

                        return (
                            <button
                                key={type}
                                className={`card-1 w-72 h-16 flex relative justify-start ${isSelected ? '!bg-gray-300' : ''} hover:bg-gray-100 duration-150`}
                                onClick={() => handleContactTypeChange(type)}
                            >
                                <div className="w-full h-full flex items-center">
                                    <div className="flex flex-1">
                                        <div className="text-lg font-medium">
                                            {thisContacts ? thisContacts.length : 0} {toDisplayStr(type)}s
                                        </div>
                                    </div>
                                    {/* <div className="w-10 opacity-35">
                                        {type === 'borrower' && <Users className="w-6 h-6 text-blue-400" />}
                                        {type === 'lead' && <Phone className="w-6 h-6 text-yellow-400" />}
                                        {type === 'customer' && <Building2 className="w-6 h-6 text-purple-400" />}
                                    </div> */}

                                </div>
                                <Loading loading={isLoading} />
                            </button>
                        )
                    })
                }
            </div>

            <div className="relative ">
                <Table
                    className="card-1 "
                    editable={true}
                    editableInline={true}
                    allowAddNew={true}
                    actions={['edit', 'delete']}
                    editRenderOrder={[
                        ['first_name', 'last_name'],
                        ['email', 'phone'],
                        ['company', 'type'],
                        ['status'],
                        ['notes']
                    ]}
                    tableExcludeKeys={[
                        'created_at', 'notes'
                    ]}
                    columns={[
                        { key: 'first_name', title: 'First Name', width: 'w-32', required: true },
                        { key: 'last_name', title: 'Last Name', width: 'w-32', required: true },
                        {
                            key: 'email',
                            title: 'Email',
                            width: 'w-48',
                            required: true,
                            type: 'email',
                            Component: ({ value }) => (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">{value || 'N/A'}</span>
                                </div>
                            ),
                            EditComponent: 'default'
                        },
                        {
                            key: 'phone',
                            title: 'Phone',
                            width: 'w-36',
                            required: true,
                            Component: ({ value }) => (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">{value || 'N/A'}</span>
                                </div>
                            )
                        },
                        {
                            key: 'company',
                            title: 'Company',
                            width: 'w-36',
                            Component: ({ value }) => (
                                <div className="flex items-center gap-2">
                                    {value && <Building2 className="w-4 h-4 text-gray-500" />}
                                    <span className="text-sm">{value || 'N/A'}</span>
                                </div>
                            )
                        },
                        {
                            key: 'type',
                            title: 'Type',
                            width: 'w-28',
                            required: true,
                            type: 'select',
                            options: contactTypes,
                            defaultValue: 'borrower',
                            Component: ({ value }) => (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium `}>
                                    {makeFirstLetterUppercase(value || 'borrower')}
                                </span>
                            ),
                            EditComponent: ({ value, onChange }) => (
                                <Dropdown fixed={true}>
                                    <div data-type="trigger" className="w-full cursor-pointer appearance-none border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                                        {makeFirstLetterUppercase(value || 'Select type')}
                                    </div>
                                    <div data-type="content" className="p-2">
                                        {contactTypes.map(type => (
                                            <div key={type} className="cursor-pointer p-1 hover:bg-gray-100 rounded" onClick={() => onChange(type)}>
                                                {makeFirstLetterUppercase(type)}
                                            </div>
                                        ))}
                                    </div>
                                </Dropdown>
                            ),
                        },
                        {
                            key: 'status',
                            title: 'Status',
                            width: 'w-24',
                            required: true,
                            type: 'select',
                            options: contactStatuses,
                            defaultValue: 'active',
                            Component: ({ value }) => (
                                <div >
                                    <StatusItem status={value} />
                                    {/* {makeFirstLetterUppercase(value || 'active')} */}
                                </div>
                            ),
                            EditComponent: ({ value, onChange }) => (
                                <Dropdown fixed={true}>
                                    <div data-type="trigger" className="w-full cursor-pointer appearance-none border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                                        {makeFirstLetterUppercase(value || 'Select status')}
                                    </div>
                                    <div data-type="content" className="p-2 flex flex-col gap-1">
                                        {contactStatuses.map(status => (
                                            <button key={status} className="hover:scale-105 duration-300" onClick={() => onChange(status)}>
                                                <StatusItem status={status} />
                                            </button>
                                        ))}
                                    </div>
                                </Dropdown>
                            ),
                        },
                        {
                            key: 'created_at',
                            title: 'Created',
                            width: 'w-28',
                            disabled: true,
                            type: 'date',
                            defaultValue: (new Date()).toISOString(),
                            Component: ({ value }) => (
                                <DateDisplay date={value} format="short" className="text-gray-700" />
                            ),
                        },
                        { key: 'notes', title: 'Notes', width: 'w-48', type: 'textarea', disabled: false },
                    ]}
                    data={_data}
                    onAddNew={handleNewItem}
                    onRowChange={handleUpdateItem}
                    onRowDelete={handleDeleteItem}
                    onChange={(newData) => {
                        console.log('Contacts table data changed: ', newData);
                    }}
                />

                <Loading loading={isLoading} />
            </div>
        </div>
    );
}