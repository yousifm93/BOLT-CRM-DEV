'use client';

import FormBuilder from "@/components/formBuilder";
import Loading from "@/components/other/loading";
import { PopupModal } from "@/components/other/modals";
import Tabs, { TabItem, TabTrigger } from "@/components/other/tabs";
import Select from "@/components/select";
import { saGetItem, saGetItems, saUpdateItem } from "@/components/serverActions.jsx";
import { notify } from "@/components/sonnar/sonnar";
import { contactTypes } from "@/data/contactTypes";
import { camelToDisplay, formatCurrency, formatPhoneNumber, getFirstLettersFromArray, makeFirstLetterUppercase, toDisplayStr } from "@/utils/other";
import { ChevronRight, Component, Phone, Mail, User, DollarSign, Pencil, User2 } from "lucide-react";
import { useState, useEffect } from "react";


const thisContactTypes = ['pre_approved_expert', 'processor', 'lender', 'account_executive']

export default function DetailView({
    pathname, searchParams, session,
    user, account, stage, itemId
}) {

    const collectionName = 'leads';
    const [isLoading, setIsLoading] = useState(true);
    const [_data, _setData] = useState([]);
    const [_users, _setUsers] = useState([]); // users for assignment etc.
    const [_contacts, _setContacts] = useState([]); // contacts for assignment etc.

    const [editKeys, setEditKeys] = useState([]); // which keys are in edit mode

    const [teamTabIndex, setTeamTabIndex] = useState(0);



    const handleUpdateItem = async (item) => {
        let resObj = {
            success: false,
            message: 'Unknown error',
            data: null,
        }
        try {
            let ssItem = { ...item };

            // delete relational fields
            if (ssItem.contacts) {
                delete ssItem.contacts;
            }
            if (ssItem.tasks) {
                delete ssItem.tasks;
            }

            setIsLoading(true);
            // make date ISO 8601
            ssItem.due_date = ssItem.due_date ? new Date(ssItem.due_date).toISOString() : null;
            const response = await saUpdateItem({
                collection: collectionName,
                query: {
                    where: { id: item.id },
                    data: ssItem
                }
            });

            // console.log('Response from updating item: ', response);
            if (response && response.success) {
                _setData(response.data);
                notify({ type: 'success', message: 'Updated !' });
                resObj.success = true;
                resObj.data = response.data;
                resObj.message = 'Done';
            } else {
                notify({ type: 'error', message: response.message || 'Failed to update item' });
                resObj.message = response.message || 'Failed to update item';
                resObj.success = false;
            }

            // console.log('Updated item: ', response);

            return resObj;

        } catch (error) {
            console.error('Error deleting item: ', error);
            notify({ type: 'error', message: 'Failed to delete item' });
            resObj.message = error.message || 'Failed to delete item';
            resObj.data = item;
            resObj.success = false;
            return resObj;
        } finally {
            setIsLoading(false);
        }
    };
    const handleDetailsUpdate = async (formData) => {
        // console.log('Form submitted with data: ', formData);
        handleUpdateItem({ id: itemId, ...formData });
        // setEditKeys([]);
    };


    // team and contacts handlers
    const handleTeamChange = async (e, contactField) => {
        try {
            const value = e.target.value;

            // Handle empty value (clearing/resetting)
            if (!value || value === '') {
                return await handleTeamReset(contactField);
            }

            const thisContact = _contacts.find(c => c.id === value);
            // console.log('Contact changed: ', thisContact, 'for field:', contactField);

            if (!thisContact) {
                notify({ type: 'error', message: 'Contact not found' });
                return;
            }

            setIsLoading(true);

            // Update specific contact field
            const response = await saUpdateItem({
                collection: collectionName,
                query: {
                    where: { id: itemId },
                    data: {
                        [contactField]: thisContact.id
                    }
                }
            });

            // console.log('Response from updating contact: ', response);

            if (response && response.success) {
                _setData(response.data);
                notify({ type: 'success', message: `${toDisplayStr(contactField)} assigned to ${thisContact.first_name} ${thisContact.last_name}!` });
            } else {
                notify({ type: 'error', message: response.message || 'Failed to update contact' });
            }

        } catch (error) {
            console.error('Error updating contact: ', error);
            notify({ type: 'error', message: 'Failed to update contact' });
        } finally {
            setIsLoading(false);
        }
    };
    const handleTeamReset = async (contactField) => {
        try {
            setIsLoading(true);

            // Clear the contact field by setting it to null
            const response = await saUpdateItem({
                collection: collectionName,
                query: {
                    where: { id: itemId },
                    data: {
                        [contactField]: null
                    }
                }
            });

            if (response && response.success) {
                _setData(response.data);
                notify({ type: 'success', message: `${toDisplayStr(contactField)} assignment cleared!` });
            } else {
                notify({ type: 'error', message: response.message || 'Failed to clear assignment' });
            }

        } catch (error) {
            console.error('Error clearing team assignment: ', error);
            notify({ type: 'error', message: 'Failed to clear assignment' });
        } finally {
            setIsLoading(false);
        }
    };
    

    const handleAddContactToLead = async (contactId) => {
        try {
            if (!contactId) return;

            const thisContact = _contacts.find(c => c.id === contactId);
            if (!thisContact) {
                notify({ type: 'error', message: 'Contact not found' });
                return;
            }

            // Check if contact is already added
            if (_data.contacts && _data.contacts.some(c => c.id === contactId)) {
                notify({ type: 'warning', message: 'Contact is already added to this lead' });
                return;
            }

            setIsLoading(true);

            // Use many-to-many relationship to connect contact to lead
            const response = await saUpdateItem({
                collection: collectionName,
                query: {
                    where: { id: itemId },
                    data: {
                        contacts: {
                            connect: { id: contactId }
                        }
                    }
                }
            });

            if (response && response.success) {
                _setData(response.data);
                notify({ type: 'success', message: `${thisContact.first_name} ${thisContact.last_name} added to lead!` });
            } else {
                notify({ type: 'error', message: response.message || 'Failed to add contact to lead' });
            }

        } catch (error) {
            console.error('Error adding contact to lead: ', error);
            notify({ type: 'error', message: 'Failed to add contact to lead' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveContactFromLead = async (contactId) => {
        try {
            if (!contactId) return;

            const thisContact = _data.contacts?.find(c => c.id === contactId);
            if (!thisContact) {
                notify({ type: 'error', message: 'Contact not found in lead' });
                return;
            }

            setIsLoading(true);

            // Use many-to-many relationship to disconnect contact from lead
            const response = await saUpdateItem({
                collection: collectionName,
                query: {
                    where: { id: itemId },
                    data: {
                        contacts: {
                            disconnect: { id: contactId }
                        }
                    }
                }
            });

            if (response && response.success) {
                _setData(response.data);
                notify({ type: 'success', message: `${thisContact.first_name} ${thisContact.last_name} removed from lead!` });
            } else {
                notify({ type: 'error', message: response.message || 'Failed to remove contact from lead' });
            }

        } catch (error) {
            console.error('Error removing contact from lead: ', error);
            notify({ type: 'error', message: 'Failed to remove contact from lead' });
        } finally {
            setIsLoading(false);
        }
    };


    const columns = [
        {
            header: '',
            className: '', // Left column - 288px fixed width
            items: [
                {
                    header: '',
                    key: 'lead-overview',
                    Component: () => {
                        const row = _data || {};

                        return (
                            <div className="flex flex-col gap-3 text-xs relative">
                                <div className="w-full h-14 flex flex-row relative items-center justify-between border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <span className="w-9 h-9 p-1 bg-yellow-400 rounded-full flex items-center justify-center text-gray-700 font-semibold">
                                            {getFirstLettersFromArray([row.first_name, row.last_name])}
                                        </span>
                                        <div className="flex flex-col text-base">
                                            <span className="font-semibold">{(row.first_name || '')}</span>
                                            <span className="font-semibold">{row.last_name || 'n/a'}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="p-1 h-fit border bg-gray-100 rounded-md hover:bg-gray-200 border-gray-300"
                                        onClick={() => {
                                            setEditKeys(['phone', 'email', 'buyers_agent', 'loan_amount', 'sales_price', 'transaction_type', 'property_type', 'loan_program']);
                                        }}
                                    >
                                        <Pencil className="size-4" />
                                    </button>
                                </div>
                                <div className="flex w-full gap-1">
                                    {/* 1st column */}
                                    <div className="w-1/2 flex flex-col gap-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-row items-center gap-1 ">
                                                <Phone className="size-4 text-gray-500 inline-block mr-1" />
                                                <span>Phone Number</span>
                                            </div>
                                            <span className="text-sm">{formatPhoneNumber(row.phone)}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-row items-center gap-1">
                                                <Mail className="size-4 text-gray-500 inline-block mr-1" />
                                                <span>Email</span>
                                            </div>
                                            <span className="text-sm overflow-hidden">{row.email || 'n/a'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-row items-center  ">
                                                <User className="size-4 mr-1 text-gray-500 inline-blocks" />
                                                <span>Buyers Agent</span>
                                            </div>
                                            <span className="text-sm">{row.buyers_agent || 'n/a'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-row items-center gap-1 ">
                                                <DollarSign className="size-4 text-gray-500 inline-block mr-1" />
                                                <span>Loan Amount</span>
                                            </div>
                                            <span className="text-sm">{formatCurrency(row.loan_amount)}</span>
                                        </div>
                                    </div>
                                    {/* 2nd column */}
                                    <div className="w-1/2 flex flex-col gap-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-row items-center gap-1 ">
                                                <DollarSign className="size-4 text-gray-500 inline-block mr-1" />
                                                <span>Sales Price</span>
                                            </div>
                                            <span className="text-sm">{formatCurrency(row.sales_price)}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span>Transaction Type</span>
                                            <div className="flex flex-row items-center gap-1 ">
                                                <span className="text-sm">{row.transaction_type || 'n/a'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span>Property Type</span>
                                            <div className="flex flex-row items-center gap-1 ">
                                                <span className="text-sm">{row.property_type || 'n/a'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span>Loan Program</span>
                                            <div className="flex flex-row items-center gap-1 ">
                                                <span className="text-sm">{row.loan_program || 'n/a'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                },
                {
                    header: 'Contacts',
                    key: 'lead-contacts',
                    Component: () => {
                        return (
                            <div className="flex flex-col gap-3">
                                <Tabs defaultIndex={teamTabIndex} onChange={(idx) => setTeamTabIndex(idx)}>
                                    <div type="trigger" className="trigger text-sm p-0.5">
                                        Team
                                    </div>
                                    <div type="trigger" className="trigger text-sm p-0.5">
                                        Contacts
                                    </div>

                                    <div type="item"  >
                                        <div className="team item flex flex-col gap-3">
                                            {
                                                thisContactTypes.map((contact, index) => {
                                                    const isAssigned = _data && _data[contact];
                                                    const assignedContact = isAssigned ? _contacts.find(c => c.id === _data[contact]) : null;
                                                    
                                                    return (
                                                        <div key={index} className="flex flex-col gap-2">
                                                            <div className="flex gap-1 items-center justify-between">
                                                                <div className="flex gap-1 items-center">
                                                                    <User2 className="size-4 text-gray-500 inline-block mr-1" />
                                                                    <span className="text-sm font-medium">{toDisplayStr(contact)}</span>
                                                                </div>
                                                                {isAssigned && (
                                                                    <button
                                                                        onClick={() => handleTeamReset(contact)}
                                                                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                                                        title={`Clear ${toDisplayStr(contact)} assignment`}
                                                                    >
                                                                        Reset
                                                                    </button>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Current Assignment Display */}
                                                            {isAssigned && assignedContact && (
                                                                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                                                                        {`${assignedContact.first_name[0]}${assignedContact.last_name[0]}`.toUpperCase()}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-medium text-blue-900">
                                                                            {assignedContact.first_name} {assignedContact.last_name}
                                                                        </span>
                                                                        {assignedContact.email && (
                                                                            <span className="text-xs text-blue-700">{assignedContact.email}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Select Dropdown */}
                                                            <div className="">
                                                                <Select
                                                                    options={[
                                                                        { label: 'Select contact...', value: '', disabled: true },
                                                                        ..._contacts.map(c => ({
                                                                            label: `${c.first_name} ${c.last_name}`,
                                                                            value: c.id,
                                                                            email: c.email,
                                                                            phone: c.phone,
                                                                            type: c.type
                                                                        }))
                                                                    ]}
                                                                    onChange={(e) => {
                                                                        handleTeamChange(e, contact);
                                                                    }}
                                                                    value=""
                                                                    placeholder={isAssigned ? "Change assignment..." : "Select contact..."}
                                                                    renderOption={(option) => {
                                                                        if (option.disabled) {
                                                                            return (
                                                                                <div className="px-3 py-2 text-gray-500 text-sm font-medium border-b border-gray-200">
                                                                                    {option.label}
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <div className="flex flex-col gap-1 py-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                                                                                        {option.label.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                                    </div>
                                                                                    <span className="font-medium text-gray-900">{option.label}</span>
                                                                                </div>
                                                                                {option.email && (
                                                                                    <div className="flex items-center gap-1 ml-8 text-xs text-gray-600">
                                                                                        <Mail className="w-3 h-3" />
                                                                                        <span>{option.email}</span>
                                                                                    </div>
                                                                                )}
                                                                                {option.phone && (
                                                                                    <div className="flex items-center gap-1 ml-8 text-xs text-gray-600">
                                                                                        <Phone className="w-3 h-3" />
                                                                                        <span>{formatPhoneNumber(option.phone)}</span>
                                                                                    </div>
                                                                                )}
                                                                                {option.type && (
                                                                                    <div className="ml-8">
                                                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                                            option.type === 'borrower' ? 'bg-blue-100 text-blue-800' :
                                                                                            option.type === 'lead' ? 'bg-yellow-100 text-yellow-800' :
                                                                                            option.type === 'customer' ? 'bg-green-100 text-green-800' :
                                                                                            'bg-gray-100 text-gray-800'
                                                                                        }`}>
                                                                                            {makeFirstLetterUppercase(option.type)}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                    <div type="item" className="contacts item ">
                                        <div className="mb-3 ">
                                            <span className="text-sm text-gray-500 mr-2">Add Contact</span>
                                            <Select
                                                options={_contacts.map(c => ({
                                                    label: `${c.first_name} ${c.last_name}`,
                                                    value: c.id,
                                                    email: c.email,
                                                    phone: c.phone,
                                                    type: c.type
                                                }))}
                                                onChange={(e) => handleAddContactToLead(e.target.value)}
                                                placeholder="Select contact to add..."
                                                renderOption={(option) => (
                                                    <div className="flex flex-col gap-1 py-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-700">
                                                                {option.label.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-gray-900">{option.label}</span>
                                                        </div>
                                                        {option.email && (
                                                            <div className="flex items-center gap-1 ml-8 text-xs text-gray-600">
                                                                <Mail className="w-3 h-3" />
                                                                <span>{option.email}</span>
                                                            </div>
                                                        )}
                                                        {option.phone && (
                                                            <div className="flex items-center gap-1 ml-8 text-xs text-gray-600">
                                                                <Phone className="w-3 h-3" />
                                                                <span>{formatPhoneNumber(option.phone)}</span>
                                                            </div>
                                                        )}
                                                        {option.type && (
                                                            <div className="ml-8">
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${option.type === 'borrower' ? 'bg-blue-100 text-blue-800' :
                                                                    option.type === 'lead' ? 'bg-yellow-100 text-yellow-800' :
                                                                        option.type === 'customer' ? 'bg-green-100 text-green-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {makeFirstLetterUppercase(option.type)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            {
                                                // contacts of this lead
                                                _data && _data.contacts && _data.contacts.length > 0 ? (
                                                    _data.contacts.map((contact, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                                                                    {contact.first_name && contact.last_name
                                                                        ? `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase()
                                                                        : contact.first_name ? contact.first_name[0].toUpperCase() : '?'
                                                                    }
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <div className="font-semibold text-gray-900">
                                                                        {contact.first_name} {contact.last_name}
                                                                    </div>
                                                                    {contact.email && (
                                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                            <Mail className="w-3 h-3" />
                                                                            <span>{contact.email}</span>
                                                                        </div>
                                                                    )}
                                                                    {contact.phone && (
                                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                            <Phone className="w-3 h-3" />
                                                                            <span>{formatPhoneNumber(contact.phone)}</span>
                                                                        </div>
                                                                    )}
                                                                    {contact.type && (
                                                                        <span className={`mt-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit ${contact.type === 'borrower' ? 'bg-blue-100 text-blue-800' :
                                                                            contact.type === 'lead' ? 'bg-yellow-100 text-yellow-800' :
                                                                                contact.type === 'customer' ? 'bg-green-100 text-green-800' :
                                                                                    'bg-gray-100 text-gray-800'
                                                                            }`}>
                                                                            {makeFirstLetterUppercase(contact.type)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveContactFromLead(contact.id)}
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                                                                title="Remove contact"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-md">
                                                        No contacts added yet. Use the dropdown above to add contacts.
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                </Tabs>

                            </div>
                        )
                    }
                },
                {
                    header: 'Chat',
                    Component: () => <span>Chat</span>
                }
            ]
        },
        {
            header: '',
            className: '', // Middle column - takes remaining space (1fr)
            items: [
                {
                    header: 'Lead Stages',
                    Component: () => <span>Lead Stages</span>
                },
                {
                    header: 'Lead Info',
                    Component: () => <span>Lead Info </span>
                }
            ]
        },
        {
            header: '',
            className: '', // Right column - 240px fixed width
            items: [
                {
                    header: 'Send Email Template',
                    Component: () => <span>Send Email Template</span>
                },
                {
                    header: 'Notes',
                    Component: () => <span>Notes</span>
                },
                {
                    header: 'Tasks',
                    Component: () => <span>Tasks</span>
                },
                {
                    header: 'Stage History',
                    Component: () => <span>Stage History</span>
                }
            ]
        }
    ];


    // initial load, fetch data
    useEffect(() => {
        const body = async () => {
            try {

                setIsLoading(true);
                const response = await saGetItem({
                    collection: collectionName,
                    query: {
                        where: {
                            id: itemId,
                            account_id: account ? account.id : null
                        },
                        include: {
                            contacts: true,
                            tasks: true,
                        }
                    }
                });

                // users
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

                // fetch contacts 
                const contacts = await saGetItems({
                    collection: 'contacts',
                    query: {
                        where: {
                            account_id: account ? account.id : null
                        }
                    }
                });

                // console.log('Fetched tasks: ', response);
                // console.log('Fetched users: ', users);
                // console.log('Fetched contacts: ', contacts);

                if (response && response.success) {
                    _setData(response.data || null);
                    _setUsers(users && users.success && users.data ? users.data : []);
                    _setContacts(contacts && contacts.success && contacts.data ? contacts.data : []);
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

    // console.log(" ");
    // console.log('===================');
    // console.log('DetailView render ==> ', pathname);
    // console.log('DetailView _data ==> ', _data);
    // console.log('DetailView data ==> ', _data);

    return (
        <div className="container-main flex flex-col gap-4 max-w-full ">
            <h1 className="text-2xl flex items-center gap-1 capitalize">
                Pipeline
                <ChevronRight className="size-4 mt-1 text-gray-500" />
                {makeFirstLetterUppercase(stage)}
                <span className="text-sm ml-2 text-gray-500">
                    {`(ID: ${itemId})`}
                </span>
            </h1>


            <div className="overflow-x-auto w-full relative h-full">
                <div className="grid grid-cols-[288px_minmax(500px,1fr)_288px] gap-3" style={{ minWidth: '1076px' }}>
                    {columns.map((col, colIndex) => (
                        <div key={colIndex} className="flex flex-col gap-3 min-w-0">
                            {/* column items */}
                            {col.items.map((item, itemIndex) => (
                                <div
                                    key={colIndex + '-item-' + itemIndex}
                                    className="flex gap-2 card-1 flex-col relative"
                                >
                                    {
                                        item.header && <span className="font-semibold">{item.header}</span>
                                    }
                                    <item.Component />
                                    <Loading loading={isLoading} />

                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                {/* <Loading loading={isLoading} message="" /> */}

            </div>


            {
                editKeys.length > 0 && (
                    <PopupModal isOpen={editKeys.length > 0} title="" onClose={() => setEditKeys([])} >
                        <FormBuilder
                            formData={_data}
                            fields={
                                editKeys.map((key, index) => {
                                    return {
                                        name: key,
                                        label: makeFirstLetterUppercase(key.replaceAll('_', ' ')),
                                        placeholder: `Enter ${key.replaceAll('_', ' ')}`,
                                        type: key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') ? 'number' : 'text',
                                        className: 'text-sm',
                                        required: false,
                                        defaultValue: _data ? _data[key] : '',
                                    }
                                })
                            }
                            onSubmit={handleDetailsUpdate}
                        />
                        <Loading loading={isLoading} message="" />
                    </PopupModal>
                )
            }

        </div>
    );
}



// <FormBuilder
//     buttonClassName="p-0.5 bg-gray-200"
//     fields={[
//         {
//             name: 'email',
//             label: 'Email',
//             placeholder: 'Enter your email',
//             type: 'email',
//             className: 'text-xs',
//             required: true,
//             hidden: false,
//             disabled: false,
//             validator: 'email'
//         },
//     ]}
// />