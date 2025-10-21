'use client';

import SmsChat from "@/components/chat/smsChat";
import FormBuilder from "@/components/formBuilder";
import EmailSender from "@/components/leads/detailViewParts/emailSender";
import { leadStages, leadStatuses } from "@/components/leads/helper";
import Loading from "@/components/other/loading";
import { PopupModal } from "@/components/other/modals";
import PriorityItem from "@/components/other/priorityItem";
import Tabs, { TabItem, TabTrigger } from "@/components/other/tabs";
import Select from "@/components/select";
import { saGetItem, saGetItems, saUpdateItem } from "@/components/serverActions.jsx";
import { notify } from "@/components/sonnar/sonnar";
import { contactTypes } from "@/data/contactTypes";
import { camelToDisplay, displayDate, formatCurrency, formatPhoneNumber, getFirstLettersFromArray, makeFirstLetterUppercase, toDisplayStr } from "@/utils/other";
import { ChevronRight, Component, Phone, Mail, User, DollarSign, Pencil, User2, X, ActivityIcon, FenceIcon, BadgeDollarSign, PhoneCall, MessageSquare, Notebook, Trash, Percent, Calendar, Warehouse, Volleyball, Lock, Shield, Square, ClipboardList } from "lucide-react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useState, useEffect, act } from "react";


const thisContactTypes = ['pre_approved_expert', 'processor', 'lender', 'account_executive']

export default function DetailView({
    pathname, searchParams, session,
    user, account, stage, itemId
}) {

    const collectionName = 'leads';
    const [isLoading, setIsLoading] = useState(true);
    const [itemLoading, setItemLoading] = useState(null); //{{col-row}} index

    const [_data, _setData] = useState([]);
    const [_users, _setUsers] = useState([]); // users for assignment etc.
    const [_contacts, _setContacts] = useState([]); // contacts for assignment etc.

    const [editKeys, setEditKeys] = useState([]); // which keys are in edit mode

    const [teamTabIndex, setTeamTabIndex] = useState(0);

    // activity tab states
    const activityTypes = ['call', 'sms', 'email', 'note'];
    const [activityTabIndex, setActivityTabIndex] = useState(0);
    const [newActivity, setNewActivity] = useState(null);


    // notes
    const [newNote, setNewNote] = useState(null);

    const router = useRouter();

    // lead info
    const leadInfoTabs = ['activity', 'loanAndProperty', 'borrowerInfo', 'financialInfo'];
    const loanAndPropertyKeys = [
        { key: 'purchasePrice', icon: DollarSign, label: 'Purchase Price' },
        { key: 'appraisalValue', icon: DollarSign, label: 'Appraisal Value' },
        { key: 'downPayment', icon: DollarSign, label: 'Down Payment' },
        { key: 'loanAmount', icon: DollarSign, label: 'Loan Amount' },
        { key: 'ltv', icon: Percent, label: 'LTV' },
        { key: 'mortgageType', icon: Warehouse, label: 'Mortgage Type' },
        { key: 'interestRate', icon: Percent, label: 'Interest Rate' },
        { key: 'anortizationTerm', icon: Calendar, label: 'Amortization Term' },
        { key: 'escrowWaver', icon: Component, label: 'Escrow Waiver' },
        { key: 'FICO score', icon: Volleyball, label: 'FICO Score' },
        { key: 'proposedMonthlyPayment', icon: DollarSign, label: 'Proposed Monthly Payment' }
    ];
    const borrowerInfoKeys = [
        { key: 'firstName', icon: User, label: 'First Name' },
        { key: 'lastName', icon: User, label: 'Last Name' },
        { key: 'socialSecurityNumber', icon: Lock, label: 'Social Security Number' },
        { key: 'dateOfBirth', icon: Calendar, label: 'Date of Birth' },
        { key: 'residenceType', icon: FenceIcon, label: 'Residence Type' },
        { key: 'maritalStatus', icon: User2, label: 'Marital Status' },
        { key: 'email', icon: Mail, label: 'Email' },
        { key: 'phone', icon: Phone, label: 'Phone' },
        { key: 'dependendents', icon: User2, label: 'Dependents' },
        { key: 'estimatedCreditScore', icon: Component, label: 'Estimated Credit Score' },
        { key: 'currentAddress', icon: FenceIcon, label: 'Current Address' },
        { key: 'currentAddressOccupancy', icon: FenceIcon, label: 'Current Address Occupancy' },
        { key: 'currentAddressTime', icon: Calendar, label: 'Current Address Time' },
        { key: 'militaryVeteran', icon: Shield, label: 'Military Veteran' }
    ]

    const handleUpdateItem = async (item, coordinates, noNotify) => {
        let resObj = {
            success: false,
            message: 'Unknown error',
            data: null,
        }
        try {
            let toSaveItem = { ...item };

            // delete relational fields
            if (toSaveItem.contacts) {
                delete toSaveItem.contacts;
            }
            if (toSaveItem.tasks) {
                delete toSaveItem.tasks;
            }

            if (coordinates) {
                setItemLoading(coordinates);
            } else {
                setIsLoading(true);
            }
            // make date ISO 8601
            toSaveItem.due_date = toSaveItem.due_date ? new Date(toSaveItem.due_date).toISOString() : null;
            const response = await saUpdateItem({
                collection: collectionName,
                query: {
                    where: { id: item.id },
                    data: toSaveItem
                }
            });

            // console.log('Response from updating item: ', response);
            if (response && response.success) {
                _setData(response.data);
                if (typeof noNotify !== 'undefined' || !noNotify) {
                    notify({ type: 'success', message: 'Updated !' });
                }
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
            if (coordinates) {
                setItemLoading(null);
            } else {
                setIsLoading(null);
            }
        }
    };
    const handleDetailsUpdate = async (formData) => {
        // console.log('Form submitted with data: ', formData);
        handleUpdateItem({ id: itemId, ...formData });
        setEditKeys([]);
    };


    // team and contacts handlers
    const handleTeamChange = async (e, contactField) => {
        try {
            const value = e.target.value;

            const thisContact = _contacts.find(c => c.id === value);
            // console.log('Contact changed: ', thisContact, 'for field:', contactField);

            if (!thisContact) {
                notify({ type: 'error', message: 'Contact not found' });
                return;
            }

            setItemLoading(`0-1`);

            // Option 1: Update specific contact field (recommended)
            const response = await saUpdateItem({
                collection: collectionName,
                query: {
                    where: { id: itemId },
                    data: {
                        [contactField]: thisContact.id
                    }
                }
            });

            // // Option 2: For many-to-many relationship (if needed)
            // const response = await saUpdateItem({
            //     collection: collectionName,
            //     query: {
            //         where: { id: itemId },
            //         data: {
            //             contacts: {
            //                 connect: { id: thisContact.id }
            //             }
            //         }
            //     }
            // });

            // console.log('Response from updating contact: ', response);

            if (response && response.success) {
                _setData(response.data);
                notify({ type: 'success', message: 'Contact updated successfully!' });
            } else {
                notify({ type: 'error', message: response.message || 'Failed to update contact' });
            }

        } catch (error) {
            console.error('Error updating contact: ', error);
            notify({ type: 'error', message: 'Failed to update contact' });
        } finally {
            // setIsLoading(null);
            setItemLoading(null);
        }
    };
    const handleTeamReset = async (contactField) => {
        try {
            // setIsLoading(true);

            setItemLoading(`0-1`);

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
            // setIsLoading(false);
            setItemLoading(null);
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

            // setIsLoading(true);
            setItemLoading(`0-1`);

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
                // _setData(response.data);
                const newData = { ..._data };
                if (newData.contacts) {
                    newData.contacts.push(thisContact);
                } else {
                    newData.contacts = [thisContact];
                }
                _setData(newData);
                notify({ type: 'success', message: `${thisContact.first_name} ${thisContact.last_name} added to lead!` });
            } else {
                notify({ type: 'error', message: response.message || 'Failed to add contact to lead' });
            }

        } catch (error) {
            console.error('Error adding contact to lead: ', error);
            notify({ type: 'error', message: 'Failed to add contact to lead' });
        } finally {
            // setIsLoading(false);
            setItemLoading(null);
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

            // setIsLoading(true);
            setItemLoading(`0-1`);

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
            setItemLoading(null);
        }
    };

    // stage and status handlers
    const handleStageChange = async (newStage) => {
        try {
            await handleUpdateItem({ id: itemId, stage: newStage });
        } catch (error) {
            console.error('Error changing stage: ', error);
            // notify({ type: 'error', message: 'Failed to change stage' });
        }
    };
    const handleStatusChange = async (newStatus) => {
        // console.log('Status change to: ', newStatus);
        const res = await handleUpdateItem({ id: itemId, status: newStatus }, `1-0`);
    };

    // activity
    const handleAddActivity = (type) => {
        setNewActivity({
            id: nanoid(25),
            userId: user.id,
            type: type,
            timestamp: new Date().toISOString(),
            text: '',
        });
    };
    const handleSaveActivity = async (activityData) => {
        try {
            let newData = { ..._data };
            if (!newData.activity) {
                newData.activity = [];
            }
            // check if activity with same id exists
            const existingActivityIndex = newData.activity.findIndex(a => a.id === activityData.id);
            if (existingActivityIndex !== -1) {
                newData.activity[existingActivityIndex] = activityData;
            } else {
                newData.activity.push(activityData);
            }
            handleUpdateItem({ id: itemId, ...newData }, `1-1`);
            setNewActivity(null);

        } catch (error) {
            console.error('Error saving activity: ', error);
            notify({ type: 'error', message: 'Failed to add activity' });
        }
    };
    const getActivitySorted = () => {
        try {
            return _data && _data.activity
                ? _data.activity.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                : [];
        } catch (error) {
            console.error('Error sorting activities: ', error);
            return [];
        }
    };
    const handleDeleteActivity = async (activityId) => {
        try {
            let newData = { ..._data };
            newData.activity = newData.activity.filter(a => a.id !== activityId);
            handleUpdateItem({ id: itemId, ...newData });
        } catch (error) {
            console.error('Error deleting activity: ', error);
            notify({ type: 'error', message: 'Failed to delete activity' });
        }
    };

    // handle notes
    const handleAddNote = () => {
        setNewNote({
            id: nanoid(25),
            userId: user.id,
            timestamp: new Date().toISOString(),
            text: '',
            title: '',
        });
    };
    const handleSaveNote = async (noteData) => {
        try {
            let newData = { ..._data };
            if (!newData.notes) {
                newData.notes = [];
            }
            // check if note with same id exists
            const existingNoteIndex = newData.notes.findIndex(n => n.id === noteData.id);
            if (existingNoteIndex !== -1) {
                newData.notes[existingNoteIndex] = noteData;
            } else {
                newData.notes.push(noteData);
            }
            handleUpdateItem({ id: itemId, ...newData }, `2-1`);
            setNewNote(null);

        } catch (error) {
            console.error('Error saving note: ', error);
            notify({ type: 'error', message: 'Failed to add note' });
        }
    };
    const getNotesSorted = () => {
        try {
            return _data && _data.notes
                ? _data.notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                : [];
        } catch (error) {
            console.error('Error sorting notes: ', error);
            return [];
        }
    };
    const handleDeleteNote = async (noteId) => {
        try {
            let newData = { ..._data };
            newData.notes = newData.notes.filter(n => n.id !== noteId);
            handleUpdateItem({ id: itemId, ...newData });
        } catch (error) {
            console.error('Error deleting note: ', error);
            notify({ type: 'error', message: 'Failed to delete note' });
        }
    };

    // handle sms chat
    const handleSmsMessagesChange = (newMessages) => {
        console.log('SMS messages changed: ', newMessages);
    };


    const handleBack = () => {
        try {
            const pathParts = pathname.split('/');
            router.push(pathParts.slice(0, -1).join('/'));
        } catch (error) {
            console.error('Error navigating back: ', error);
        }
    }

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
                                        <button onClick={handleBack}>
                                            <span className="w-9 h-9 p-1 text-nowrap bg-yellow-400 rounded-full flex items-center justify-center text-gray-700 font-semibold">
                                                {getFirstLettersFromArray([row.first_name, row.last_name])}
                                            </span>
                                        </button>
                                        <div className="flex flex-col text-base text-nowrap">
                                            {(row.first_name || '')} &nbsp;{row.last_name || 'n/a'}
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
                                                    return (
                                                        <div key={index} className="flex flex-col ">
                                                            <div className="">
                                                                <div className="flex gap-1 items-center">
                                                                    <div className="flex flex-1 gap-1 items-center">
                                                                        <User2 className="size-4 text-gray-500 inline-block mr-1" />
                                                                        <span>{toDisplayStr(contact)}</span>
                                                                    </div>
                                                                    {_data[contact] &&
                                                                        <button onClick={() => handleTeamReset(contact)}>
                                                                            <X className="size-4 text-gray-500 inline-block mr-1 hover:bg-gray-200 rounded-md duration-300" />
                                                                        </button>
                                                                    }
                                                                </div>
                                                                <Select
                                                                    options={_contacts.map(c => ({
                                                                        label: `${c.first_name} ${c.last_name}`,
                                                                        value: c.id,
                                                                        email: c.email,
                                                                        phone: c.phone,
                                                                        type: c.type
                                                                    }))}
                                                                    onChange={(e) => {
                                                                        handleTeamChange(e, contact);
                                                                    }}
                                                                    value={_data && _data[contact] ? _data[contact] : ''}
                                                                    renderOption={(option) => (
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
                                                                    renderValue={(option) => (
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                                                                                {option.label.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                            </div>
                                                                            <span>{option.label}</span>
                                                                        </div>
                                                                    )}
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
                    Component: () => {
                        return (
                            <SmsChat
                                contactPhone={_data?.phone || null}
                                data={_data?.sms_messages}
                                onChange={(newMessages) => {
                                    handleSmsMessagesChange(newMessages);
                                }}
                            />
                        )
                    }
                }
            ]
        },
        {
            header: '',
            className: '', // Middle column - takes remaining space (1fr)
            items: [
                {
                    header: '',
                    key: 'lead-stages',
                    Component: () => {

                        return (
                            <div className="w-full flex flex-col gap-4 overflow-hidden">
                                {/* lead stages */}
                                <div className="stages ">
                                    <div className="mb-1 flex items-center gap-2">
                                        <span>Lead Stages</span>
                                        <span className="text-sm mr-2 opacity-55">
                                            {'(click to update stage)'}
                                        </span>
                                    </div>
                                    {/* <div className="grid grid-cols-3 gap-0.5 shadow-sm text-sm">
                                        {leadStages.map((s, index) => {
                                            const isSelected = s.toLowerCase() === stage.toLowerCase();
                                            return (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleStageChange(s);
                                                    }}
                                                    key={index}
                                                    className={`py-1.5 px-1 border border-gray-300 rounded-md
                                                    ${isSelected ? 'font-semibold bg-yellow-400 ' : 'text-gray-700'} 
                                                    hover:bg-yellow-100 hover:cursor-pointer
                                                    `}
                                                >
                                                    <span className="text-center block">
                                                        {toDisplayStr(s)}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div> */}
                                    <div className="flex shadow-sm">
                                        {leadStages.map((ls, index) => {
                                            // const { name, label } = ls;
                                            const name = ls;
                                            const isSelected = _data && _data?.stage
                                                ? name.toLowerCase() === _data?.stage.toLowerCase()
                                                : null;
                                            return (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleStageChange(name);
                                                    }}
                                                    key={index}
                                                    className={`w-full p-2.5 border border-r-0 border-gray-300 
                                                    ${isSelected ? 'font-semibold bg-yellow-200' : 'text-gray-700'} 
                                                    ${index === 0 ? 'rounded-l-md' : ''}
                                                    ${index === leadStages.length - 1 ? 'border-r rounded-r-md' : ''}
                                                    last:border-r 
                                                    hover:bg-yellow-50 hover:cursor-pointer
                                                    `}
                                                >
                                                    <span className="text-sm text-center w-full block">
                                                        {toDisplayStr(name)}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>

                                </div>
                                {/* lead statuses */}
                                {/* <div className="status ">
                                    <div className="mb-1 flex items-center gap-2">
                                        <span>Lead Status</span>
                                        <span className="text-sm mr-2 opacity-55">
                                            {'(click to update status)'}
                                        </span>
                                    </div>
                                    <div className="flex shadow-sm">
                                        {leadStatuses[stage].map((ls, index) => {
                                            const { name, label } = ls;
                                            const isSelected = _data && _data?.status
                                                ? name.toLowerCase() === _data?.status.toLowerCase()
                                                : null;
                                            return (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleStatusChange(name);
                                                    }}
                                                    key={index}
                                                    className={`w-full p-2.5 border border-r-0 border-gray-300 
                                                    ${isSelected ? 'font-semibold bg-sky-200' : 'text-gray-700'} 
                                                    ${index === 0 ? 'rounded-l-md' : ''}
                                                    ${index === leadStatuses[stage].length - 1 ? 'border-r rounded-r-md' : ''}
                                                    last:border-r 
                                                    hover:bg-sky-50 hover:cursor-pointer
                                                    `}
                                                >
                                                    <span className="text-sm text-center w-full block">
                                                        {toDisplayStr(name)}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div> */}

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-starting gap-3">
                                        <h3 className="">Status Details</h3>
                                        <button
                                            className="p-1 h-fit border bg-gray-100 rounded-md hover:bg-gray-200 border-gray-300"
                                            onClick={() => {
                                                setEditKeys(['priority_level', 'follow_up_required', 'referral_source', 'contact_preference',]);
                                            }}
                                        >
                                            <Pencil className="size-4" />
                                        </button>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="opacity-50">Priority level</span>
                                            <PriorityItem level={_data?.priority_level || 'N/A'} >
                                                <span>{_data?.priority_level || 'N/A'}</span>
                                            </PriorityItem>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="opacity-50">Referral Source</span>
                                            <span>{_data?.referral_source || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="opacity-50">Contact Preference</span>
                                            <span>{_data?.contact_preference || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="opacity-50">Follow Up Required</span>
                                            <span>{_data?.follow_up_required || 'N/A'}</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )
                    }
                },
                {
                    header: 'Lead Info',
                    Component: () => {

                        return (
                            <div className="w-full min-h-[720px] flex flex-col gap-4 overflow-hidden">
                                <Tabs defaultIndex={activityTabIndex} onChange={(idx) => setActivityTabIndex(idx)}>
                                    {
                                        leadInfoTabs.map((t, i) => {
                                            let Icon = null;
                                            if (t === 'activity') Icon = ActivityIcon;
                                            if (t === 'loanAndProperty') Icon = FenceIcon;
                                            if (t === 'borrowerInfo') Icon = User2;
                                            if (t === 'financialInfo') Icon = BadgeDollarSign;

                                            return (
                                                <button
                                                    key={i} type="trigger"
                                                    className="trigger text-nowrap text-xs md:text-sm p-0.5 flex items-center gap-2"
                                                >
                                                    <Icon className="size-4" />
                                                    {toDisplayStr(t)}
                                                </button>
                                            )
                                        })
                                    }

                                    <div type="item" className="activity item p-2">
                                        <div className="flex gap-4">
                                            {activityTypes.map((type, index) => {

                                                let Icon = null;
                                                if (type === 'call') Icon = Phone;
                                                if (type === 'sms') Icon = MessageSquare;
                                                if (type === 'email') Icon = Mail;
                                                if (type === 'note') Icon = Notebook;

                                                return (
                                                    <button
                                                        key={index}
                                                        className="w-20 flex items-center gap-2 justify-center border rounded-lg shadow-sm p-1 border-gray-200 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => handleAddActivity(type)}
                                                    >
                                                        <Icon className="size-4 text-gray-500 inline-block" />
                                                        <span className="">{toDisplayStr(type)}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <div className="mt-4 flex flex-col gap-3 max-h-96 overflow-y-auto slick-scrollbar">
                                            {_data && _data.activity && _data.activity.length > 0 ? (
                                                // sort by created_at desc
                                                getActivitySorted().map((act, index) => {

                                                    let Icon = null;
                                                    if (act.type === 'call') Icon = Phone;
                                                    if (act.type === 'sms') Icon = MessageSquare;
                                                    if (act.type === 'email') Icon = Mail;
                                                    if (act.type === 'note') Icon = Notebook;

                                                    let thisUser = null;
                                                    let initials = 'n/a';
                                                    if (act?.userId) {
                                                        thisUser = _users.find(u => u.id === act?.userId);
                                                    }
                                                    if (thisUser) {
                                                        initials = getFirstLettersFromArray([thisUser.first_name, thisUser.last_name]).toUpperCase();
                                                    }
                                                    // console.log('thisUser', thisUser);
                                                    // console.log('initials', initials);

                                                    return (
                                                        <div key={index} className="activity-item p-2 border-b border-gray-200">
                                                            <div className="flex justify-between gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-gray-500 mr-2">
                                                                    {initials}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center">
                                                                        <div className="w-20 flex items-center gap-2 justify-center border rounded-lg  p-1 border-gray-200 bg-orange-50">
                                                                            <Icon className="size-4 text-gray-500 inline-block" />
                                                                            <span className="">{toDisplayStr(act.type)}</span>
                                                                        </div>
                                                                        <span className="text-gray-500 text-sm ml-2">{displayDate(act.timestamp)}</span>
                                                                    </div>
                                                                    <div className="mt-1 text-sm text-gray-600">{act.text}</div>
                                                                    <span className="opacity-50 text-xs">
                                                                        {thisUser ? `by ${thisUser.first_name} ${thisUser.last_name}` : 'by n/a'}
                                                                    </span>
                                                                </div>
                                                                <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteActivity(act.id)}>
                                                                    <Trash className="size-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <div className="p-2 text-gray-500">No activities found</div>
                                            )}
                                        </div>
                                    </div>

                                    <div type="item" className="loan-and-property item p-2">
                                        <div className="grid p-3 grid-cols-1 md:grid-cols-2 gap-4">
                                            {loanAndPropertyKeys.map((field, index) => {
                                                const Icon = field.icon;
                                                return (
                                                    <div key={index} className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="size-4 text-gray-500" />
                                                            <span className="text-sm font-medium text-gray-700">{field.label}</span>
                                                        </div>
                                                        <span className="text-sm text-gray-900 ml-6">
                                                            {_data && _data[field.key] ? _data[field.key] : 'N/A'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div type="item" className="borrower-info item p-2">
                                        <div className="grid p-3 grid-cols-1 md:grid-cols-2 gap-4">
                                            {borrowerInfoKeys.map((field, index) => {
                                                const Icon = field.icon;
                                                return (
                                                    <div key={index} className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="size-4 text-gray-500" />
                                                            <span className="text-sm font-medium text-gray-700">{field.label}</span>
                                                        </div>
                                                        <span className="text-sm text-gray-900 ml-6">
                                                            {_data && _data[field.key] ? _data[field.key] : 'N/A'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div type="item" className="financial-info item p-2">
                                        <div className="p-4 text-gray-500 border border-dashed border-gray-300 rounded-md text-center">
                                            Financial information content coming soon...
                                        </div>
                                    </div>

                                </Tabs>
                            </div>
                        )
                    }
                }
            ]
        },
        {
            header: '',
            className: '', // Right column - 240px fixed width
            items: [
                {
                    header: '',
                    Component: () => {
                        return (
                            <div className="flex flex-col gap-2 ">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold"> Send Email Template</h3>
                                    <Mail className="size-4 " />
                                </div>
                                <EmailSender contacts={_contacts} account={account} user={user} />
                            </div>
                        )
                    }
                },
                {
                    header: 'Notes',
                    Component: () => {

                        return (
                            <div className="flex flex-col gap-3 h-72 overflow-y-auto slick-scrollbar">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Quick Notes</span>
                                    <button
                                        onClick={handleAddNote}
                                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                    >
                                        <Notebook className="w-3 h-3" />
                                        Add Note
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto slick-scrollbar">
                                    {_data && _data.notes && _data.notes.length > 0 ? (
                                        getNotesSorted().map((note, index) => {
                                            let thisUser = null;
                                            let initials = 'n/a';
                                            if (note?.userId) {
                                                thisUser = _users.find(u => u.id === note?.userId);
                                            }
                                            if (thisUser) {
                                                initials = getFirstLettersFromArray([thisUser.first_name, thisUser.last_name]).toUpperCase();
                                            }

                                            return (
                                                <div key={index} className="p-2 bg-gray-50 rounded-md border border-gray-200">
                                                    <div className="flex justify-between items-start gap-2 mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center text-white text-xs font-medium">
                                                                {initials}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                {note.title && (
                                                                    <span className="text-xs font-medium text-gray-900">
                                                                        {note.title}
                                                                    </span>
                                                                )}
                                                                <span className="text-xs text-gray-500">
                                                                    {displayDate(note.timestamp)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteNote(note.id)}
                                                            className="text-red-400 hover:text-red-600 p-0.5"
                                                            title="Delete note"
                                                        >
                                                            <Trash className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    <div className="text-xs text-gray-700 mt-1 whitespace-pre-wrap">
                                                        {note.text}
                                                    </div>

                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {thisUser ? `by ${thisUser.first_name} ${thisUser.last_name}` : 'by n/a'}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="text-center text-gray-500 py-4 border border-dashed border-gray-300 rounded-md">
                                            <Notebook className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                            <p className="text-xs">No notes yet</p>
                                            <p className="text-xs text-gray-400 mt-1">Click "Add Note" to get started</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }
                },
                {
                    header: 'Tasks',
                    Component: () => {
                        return (
                            <div className="flex flex-col gap-3 h-72 overflow-y-auto slick-scrollbar">
                                {_data && _data?.tasks && _data?.tasks.length > 0 ? (
                                    _data.tasks.map((task, index) => {

                                        console.log('task', task);
                                        let creatorName = 'n/a'
                                        if (task.creator_id) {
                                            const creator = _users.find(user => user.id === task.creator_id)
                                            creatorName = creator ? `${creator.first_name} ${creator.last_name}` : 'n/a'
                                        }

                                        return (
                                            <div className="flex gap-3 items-center border-b border-gray-100" key={'task' + index}>
                                                <div>
                                                    <Square className="size-4 text-yellow-400" />
                                                </div>
                                                <div className="flex flex-col ">
                                                    <span className="font-semibold">{task?.title || 'no title'}</span>
                                                    <span>{displayDate(task?.due_date) || 'no due date'}</span>
                                                    <div className="opacity-55">
                                                        <span>
                                                            Created by: {creatorName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center text-gray-500 py-4 border border-dashed border-gray-300 rounded-md">
                                        <ClipboardList className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        <p className="text-xs">No tasks yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Click "Add Task" to get started</p>
                                    </div>
                                )}
                            </div>
                        )
                    }
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
            {/* <h1 className="text-2xl flex items-center gap-1 capitalize">
                Pipeline
                <ChevronRight className="size-4 mt-1 text-gray-500" />
                {makeFirstLetterUppercase(stage)}
                <span className="text-sm ml-2 opacity-50">
                    {`(ID: ${itemId})`}
                </span>
            </h1> */}

            <div className="overflow-x-auto w-full relative h-full">
                <div className="grid grid-cols-[450px_minmax(500px,1fr)_450px] gap-3" style={{ minWidth: '1076px' }}>
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
                                    <Loading loading={itemLoading === `${colIndex}-${itemIndex}`} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                {/* <Loading loading={isLoading} message="" /> */}
            </div>
            {
                editKeys.length > 0 && (
                    <PopupModal isOpen={editKeys.length > 0} title="Edit Lead" onClose={() => setEditKeys([])} >
                        <FormBuilder
                            formData={_data}
                            fields={
                                editKeys.map((key, index) => {
                                    return {
                                        name: key,
                                        label: makeFirstLetterUppercase(key.replaceAll('_', ' ')),
                                        placeholder: `Enter ${key.replaceAll('_', ' ')}`,
                                        type: key.toLowerCase().includes('price') || key.toLowerCase().includes('amount')
                                            ? 'number'
                                            : ['priority_level', 'follow_up_required'].includes(key)
                                                ? 'select'
                                                : 'text',
                                        options: key === 'priority_level' ? [
                                            { label: 'Low', value: 'Low' },
                                            { label: 'Medium', value: 'Medium' },
                                            { label: 'High', value: 'High' },
                                        ] : key === 'follow_up_required' ? [
                                            { label: 'Yes', value: 'Yes' },
                                            { label: 'No', value: 'No' },
                                        ] : [],
                                        className: 'text-sm',
                                        required: false,
                                        defaultValue: _data ? _data[key] : '',
                                    }
                                })
                            }
                            onSubmit={(d) => {
                                handleDetailsUpdate(d);
                            }}
                        />
                        <Loading loading={isLoading} message="" />
                    </PopupModal>
                )
            }
            {
                newActivity && (
                    <PopupModal isOpen={newActivity} title="Add Activity" onClose={() => setNewActivity(null)} >
                        <FormBuilder
                            formData={newActivity}
                            fields={
                                Object.keys(newActivity)
                                    .filter((key) => !['id', 'userId'].includes(key))
                                    .map((key) => {
                                        return {
                                            name: key,
                                            label: makeFirstLetterUppercase(key.replaceAll('_', ' ')),
                                            placeholder: `Enter ${key.replaceAll('_', ' ')}`,
                                            type: key === 'timestamp'
                                                ? 'date'
                                                : key === 'text' ? 'textarea' : 'text',
                                            className: 'text-sm',
                                            required: true,
                                            defaultValue: newActivity ? newActivity[key] : '',
                                            disabled: ['id', 'userId', 'type', 'timestamp'].includes(key) ? true : false,
                                        }
                                    })
                            }
                            onSubmit={(d) => {
                                handleSaveActivity(d);
                            }}
                        />
                        <Loading loading={isLoading} message="" />
                    </PopupModal>
                )
            }
            {
                newNote && (
                    <PopupModal isOpen={newNote} title="Add Note" onClose={() => setNewNote(null)} >
                        <FormBuilder
                            formData={newNote}
                            fields={[
                                {
                                    name: 'title',
                                    label: 'Note Title',
                                    placeholder: 'Enter note title (optional)',
                                    type: 'text',
                                    className: 'text-sm',
                                    required: false,
                                    defaultValue: newNote ? newNote.title : '',
                                },
                                {
                                    name: 'text',
                                    label: 'Note Content',
                                    placeholder: 'Enter your note...',
                                    type: 'textarea',
                                    className: 'text-sm',
                                    rows: 4,
                                    required: true,
                                    defaultValue: newNote ? newNote.text : '',
                                },
                                // {
                                //     name: 'timestamp',
                                //     label: 'Date & Time',
                                //     type: 'datetime-local',
                                //     className: 'text-sm',
                                //     required: true,
                                //     defaultValue: newNote ? newNote.timestamp : '',
                                //     disabled: false,
                                // }
                            ]}
                            onSubmit={(d) => {
                                handleSaveNote({
                                    ...newNote,
                                    ...d
                                });
                            }}
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