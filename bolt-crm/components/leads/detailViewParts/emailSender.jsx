'use client';

import Select from "@/components/select";
import { saGetItems, saSendEmail } from "@/components/serverActions.jsx";
import { notify } from "@/components/sonnar/sonnar";
import { useState, useEffect } from "react";



export default function EmailSender({ contacts, lead, user, account }) {

    const collectionName = 'email_templates';
    const [isLoading, setIsLoading] = useState(false);
    const [_templates, _setTemplates] = useState([]);
    const [_selectedTemplate, _setSelectedTemplate] = useState(null);
    const [_selectedContacts, _setSelectedContacts] = useState([]);

    const [isSending, setIsSending] = useState(false);


    const handleSendEmail = async () => {
        try {

            const response = await saSendEmail({
                template: _selectedTemplate,
                contacts: _selectedContacts,
            })

            if (response && response.success) {
                notify({ type: 'success', message: 'Email(s) sent successfully' });
            } else {
                notify({ type: 'error', message: response.message || 'Failed to send email(s)' });
            }

        } catch (error) {
            console.error('Error sending email: ', error);
            notify({ type: 'error', message: 'Failed to send email' });
        }

    }


    // initial load, fetch data
    useEffect(() => {
        const body = async () => {
            try {

                const response = await saGetItems({
                    collection: collectionName,
                    query: {
                        where: {
                            account_id: account ? account.id : null
                        },
                    }
                });

                // const users = await saGetItems({
                //     collection: 'users',
                //     query: {
                //         where: {
                //             users_and_accounts: {
                //                 some: {
                //                     account_id: account.id, // or your accountId variable
                //                 },
                //             },
                //         },
                //         include: {
                //             users_and_accounts: {
                //                 include: {
                //                     account: true,
                //                 },
                //             },
                //         },
                //     }
                // });

                // console.log('Fetched tasks: ', response);
                // console.log('Fetched users: ', users);

                if (response && response.success) {
                    _setTemplates(response.data || []);
                    // _setUsers(users && users.success && users.data ? users.data : []);
                } else {
                    notify({ type: 'error', message: response.message || 'Failed to fetch tasks' });
                }


            } catch (error) {
                console.error('Error fetching tasks: ', error);
            }
        };
        body();
    }, []);

    // console.log('Templates: ', _templates);
    // console.log('_selectedContacts: ', _selectedContacts);

    return (
        <div className="w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <span>From</span>
                <input
                    className="form-control w-full"
                    disabled
                    value={'hello@mortgagebolt.com'}
                />
            </div>

            <div className="flex flex-col gap-1">
                <span>Select Template</span>
                <Select
                    options={_templates.map(t => ({ value: t.id, label: t.name }))}
                    value={_selectedTemplate?.id}
                    onChange={(e) => {
                        const value = e.target ? e.target.value : (typeof e === 'string' ? e : (e && e.value ? e.value : null));
                        const template = _templates.find(t => t.id === value);
                        _setSelectedTemplate(template);
                    }}
                />
            </div>

            <div className="flex flex-col gap-1">
                <span>Select Contacts/Recipients</span>
                <Select
                    options={contacts.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name} <${c.email}>` }))}
                    value={_selectedContacts.map(c => c.id)}
                    onChange={(e) => {
                        const selectedIds = e.target.value; // This will be an array of strings
                        // console.log('Selected IDs:', selectedIds);

                        // Convert array of IDs back to array of contact objects for state
                        const selectedContacts = contacts.filter(c => selectedIds.includes(c.id));

                        _setSelectedContacts(selectedContacts);
                    }}
                    multiple={true}
                />
            </div>

            {/* send email button */}
            <div className="flex justify-end">
                <button
                    className="btn btn-primary"
                    onClick={handleSendEmail}
                    disabled={isSending || !_selectedContacts.length}
                >
                    {isSending ? 'Sending...' : 'Send Email'}
                </button>
            </div>
        </div>
    );
}