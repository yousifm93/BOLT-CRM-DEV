'use client';
import { Dropdown } from "@/components/other/dropdown";
import Loading from "@/components/other/loading";
import { saCreateItem, saDeleteItem, saGetItems, saUpdateItem } from "@/components/serverActions.jsx";
import { notify } from "@/components/sonnar/sonnar";
import Table from "@/components/table";
import { useState, useEffect } from "react";
import { Mail, FileText, Eye, Send, Mails, SquareCode } from "lucide-react";
import { makeFirstLetterUppercase } from "@/utils/other";
import { PopupModal } from "@/components/other/modals";

export default function Emails({ pathname, user, account, session }) {

    const collectionName = 'email_templates';
    const [isLoading, setIsLoading] = useState(true);
    const [_data, _setData] = useState([]);
    const [previewTemplate, setPreviewTemplate] = useState(null);

    const handleNewItem = async (item) => {
        let resObj = {
            success: false,
            message: 'Unknown error',
            data: null,
        }
        try {
            // add account_id to item if you have account-based filtering
            item.account_id = account ? account.id : null;

            const response = await saCreateItem({
                collection: collectionName,
                data: item
            });

            console.log('Response from adding new email template: ', response);
            if (response && response.success) {
                _setData(prev => [...prev, response.data]);
                // notify({ type: 'success', message: 'Email template created successfully' });
                resObj.success = true;
                resObj.data = response.data;
                resObj.message = 'Done';
            } else {
                resObj.success = false;
                resObj.message = response.message || 'Failed to create email template';
                notify({ type: 'error', message: response.message || 'Failed to create email template' });
            }

            return resObj;
        } catch (error) {
            console.error('Error adding new email template: ', error);
            notify({ type: 'error', message: 'Failed to create email template' });
            resObj.success = false;
            resObj.message = error.message || 'Failed to create email template';
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

            console.log('Response from updating email template: ', response);

            if (response && response.success) {
                _setData(prev => prev.map(i => i.id === item.id ? response.data : i));
                // notify({ type: 'success', message: 'Email template updated successfully' });
                resObj.success = true;
                resObj.data = response.data;
                resObj.message = 'Done';
            } else {
                notify({ type: 'error', message: response.message || 'Failed to update email template' });
                resObj.message = response.message || 'Failed to update email template';
                resObj.success = false;
            }

            return resObj;

        } catch (error) {
            console.error('Error updating email template: ', error);
            notify({ type: 'error', message: 'Failed to update email template' });
            resObj.message = error.message || 'Failed to update email template';
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
                // notify({ type: 'success', message: 'Email template deleted successfully' });
                resObj.success = true;
                resObj.message = 'Done';
            } else {
                notify({ type: 'error', message: response.message || 'Failed to delete email template' });
                resObj.message = response.message || 'Failed to delete email template';
                resObj.success = false;
            }

            return resObj;
        } catch (error) {
            console.error('Error deleting email template: ', error);
            notify({ type: 'error', message: 'Failed to delete email template' });
            resObj.message = error.message || 'Failed to delete email template';
            resObj.data = item;
            resObj.success = false;
            return resObj;
        }
    };

    const handlePreviewTemplate = (template) => {
        setPreviewTemplate(template);
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
                            account_id: account ? account.id : null // uncomment if using account-based filtering
                        },
                        orderBy: {
                            created_at: 'desc'
                        }
                    }
                });

                // console.log('Fetched email templates: ', response);

                if (response && response.success) {
                    _setData(response.data || []);
                } else {
                    notify({ type: 'error', message: response.message || 'Failed to fetch email templates' });
                }

            } catch (error) {
                console.error('Error fetching email templates: ', error);
            } finally {
                setIsLoading(false);
            }
        };
        body();
    }, []);

    const getTemplateStats = () => {
        try {
            if (!_data || !Array.isArray(_data)) return { total: 0, recent: 0 };

            const total = _data.length;
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const recent = _data.filter(template =>
                new Date(template.created_at) > weekAgo
            ).length;

            return { total, recent };
        } catch (error) {
            return { total: 0, recent: 0 };
        }
    };

    const stats = getTemplateStats();

    return (
        <div className="container-main w-full flex flex-col gap-6">
            <h1 className="text-2xl flex items-center gap-2">
                Email Templates
            </h1>

            <div className="w-full flex flex-wrap gap-4">
                <div className="card-1 flex flex-1 h-20 relative">
                    <div className="w-full h-full flex">
                        <div className="w-full">
                            <div className="">
                                <span className="text-2xl font-semibold">
                                    {stats.total}
                                </span>
                            </div>
                            <div className="">Total Templates</div>
                        </div>
                        <div className="w-12 opacity-70">
                            <Mails className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                    <Loading loading={isLoading} />
                </div>

                <div className="card-1 flex flex-1 h-20 relative">
                    <div className="w-full h-full flex">
                        <div className="w-full">
                            <div className="">
                                <span className="text-2xl font-semibold">
                                    {stats.recent}
                                </span>
                            </div>
                            <div className="">Recent (7 days)</div>
                        </div>
                        <div className="w-12 opacity-70">
                            <FileText className="w-8 h-8 text-green-400" />
                        </div>
                    </div>
                    <Loading loading={isLoading} />
                </div>
            </div>

            <div className="w-full relative rounded-md overflow-x-auto">
                <Table
                    className="card-1 min-w-full"
                    editable={true}
                    editableInline={true}
                    allowAddNew={true}
                    actions={['edit', 'delete', 'preview']}
                    previewKey="body"
                    editRenderOrder={[
                        ['name', 'subject'],
                        ['body']
                    ]}
                    tableExcludeKeys={['body']}
                    // nonEditables={['body']}
                    onPreview={handlePreviewTemplate}
                    columns={[
                        {
                            key: 'name',
                            title: 'Template Name',
                            width: 'w-48',
                            required: true,
                            Component: ({ value, row }) => (
                                <div className="flex items-center gap-2">
                                    <Mails className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium">{value}</span>
                                </div>
                            )
                        },
                        {
                            key: 'subject',
                            title: 'Subject',
                            width: 'w-64',
                            required: true,
                            Component: ({ value }) => (
                                <span className="text-gray-700">{value}</span>
                            )
                        },
                        {
                            key: 'body',
                            title: 'Body Preview (HTML)',
                            width: 'w-96',
                            required: true,
                            type: 'textarea',
                            Component: ({ value, row }) => (
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <span className="text-sm text-gray-600 line-clamp-2">
                                            {value && value.length > 100
                                                ? value.substring(0, 100) + '...'
                                                : value || 'No content'
                                            }
                                        </span>
                                    </div>
                                    <div title="Content type indicator">
                                        {/<[a-z][\s\S]*>/i.test(value) ? (
                                            <SquareCode className="w-4 h-4 text-orange-500" title="HTML Content" />
                                        ) : (
                                            <FileText className="w-4 h-4 text-blue-500" title="Text Content" />
                                        )}
                                    </div>
                                </div>
                            )
                        },
                        // {
                        //     key: 'updated_at',
                        //     title: 'Updated',
                        //     width: 'w-32',
                        //     disabled: true,
                        //     Component: ({ value }) => {
                        //         try {
                        //             const date = new Date(value);
                        //             return (
                        //                 <span className="text-sm text-gray-500">
                        //                     {date.toLocaleDateString()}
                        //                 </span>
                        //             );
                        //         } catch {
                        //             return <span className="text-sm text-gray-500">-</span>;
                        //         }
                        //     }
                        // }
                    ]}
                    data={_data}
                    onAddNew={handleNewItem}
                    onRowChange={handleUpdateItem}
                    onRowDelete={handleDeleteItem}
                    onChange={(newData) => {
                        console.log('Email templates data changed: ', newData);
                    }}
                />

                <Loading loading={isLoading} />
            </div>

            {/* Preview Modal */}
            {previewTemplate && (
                <PopupModal
                    isOpen={!!previewTemplate}
                    title={`Preview: ${previewTemplate.name}`}
                    onClose={() => setPreviewTemplate(null)}
                    className="w-96"
                >
                    <div className="flex w-96 flex-col gap-4">
                        <div className="border-b pb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Mail className="w-5 h-5 text-blue-500" />
                                <span className="font-medium">Subject:</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md">
                                <span className="text-gray-800">{previewTemplate.subject}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-5 h-5 text-green-500" />
                                <span className="font-medium">Body:</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto slick-scrollbar">
                                <div className="whitespace-pre-wrap text-gray-800 text-sm">
                                    {previewTemplate.body}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    // TODO: Implement email sending functionality
                                    notify({ type: 'info', message: 'Email sending functionality coming soon!' });
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send Test Email
                            </button>
                        </div>
                    </div>
                </PopupModal>
            )}
        </div>
    );
}