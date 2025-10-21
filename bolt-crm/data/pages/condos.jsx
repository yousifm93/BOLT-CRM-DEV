'use client';
import Loading from "@/components/other/loading";
import { saCreateItem, saDeleteItem, saGetItems, saUpdateItem } from "@/components/serverActions.jsx";
import { notify } from "@/components/sonnar/sonnar";
import Table from "@/components/table";
import { useState, useEffect } from "react";
import { applyFiltersToPrismaQuery } from "@/services/prisma";

export default function Condos({ pathname, account, user, session }) {

    const collectionName = 'condos';
    const [isLoading, setIsLoading] = useState(true);
    const [_data, _setData] = useState([]);

    const handleNewItem = async (item) => {
        let resObj = {
            success: false,
            message: 'Unknown error',
            data: null,
        }
        try {
            let toSaveItem = { ...item };

            // add account_id to item
            toSaveItem.account_id = account ? account.id : null;
            
            // convert date fields to ISO string
            if (toSaveItem.approval_expiration) {
                toSaveItem.approval_expiration = new Date(toSaveItem.approval_expiration).toISOString();
            }
            
            // convert number fields to float
            if (toSaveItem.primary_down_pmt) {
                toSaveItem.primary_down_pmt = parseFloat(toSaveItem.primary_down_pmt);
            }
            if (toSaveItem.secondary_down_pmt) {
                toSaveItem.secondary_down_pmt = parseFloat(toSaveItem.secondary_down_pmt);
            }
            if (toSaveItem.investment_down_pmt) {
                toSaveItem.investment_down_pmt = parseFloat(toSaveItem.investment_down_pmt);
            }

            const response = await saCreateItem({
                collection: collectionName,
                data: toSaveItem
            });
            console.log('Response from adding new condo: ', response);
            if (response && response.success) {
                _setData(prev => [...prev, response.data]);
                resObj.success = true;
                resObj.data = response.data;
                resObj.message = 'Done';
            } else {
                resObj.success = false;
                resObj.message = response.message || 'Failed to add new condo';
                notify({ type: 'error', message: response.message || 'Failed to add new condo' });
            }

            return resObj;
        } catch (error) {
            console.error('Error adding new condo: ', error);
            notify({ type: 'error', message: 'Failed to add new condo' });
            resObj.success = false;
            resObj.message = error.message || 'Failed to add new condo';
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
            
            // convert date fields to ISO string
            if (updatedItem.approval_expiration) {
                updatedItem.approval_expiration = new Date(updatedItem.approval_expiration).toISOString();
            }
            
            // convert number fields to float
            if (updatedItem.primary_down_pmt) {
                updatedItem.primary_down_pmt = parseFloat(updatedItem.primary_down_pmt);
            }
            if (updatedItem.secondary_down_pmt) {
                updatedItem.secondary_down_pmt = parseFloat(updatedItem.secondary_down_pmt);
            }
            if (updatedItem.investment_down_pmt) {
                updatedItem.investment_down_pmt = parseFloat(updatedItem.investment_down_pmt);
            }
            
            const response = await saUpdateItem({
                collection: collectionName,
                query: {
                    where: { id: item.id },
                    data: updatedItem
                }
            });
            console.log('Response from updating condo: ', response);

            if (response && response.success) {
                _setData(prev => prev.map(i => i.id === item.id ? response.data : i));
                resObj.success = true;
                resObj.data = response.data;
                resObj.message = 'Done';
            } else {
                notify({ type: 'error', message: response.message || 'Failed to update condo' });
                resObj.message = response.message || 'Failed to update condo';
                resObj.success = false;
            }

            return resObj;

        } catch (error) {
            console.error('Error updating condo: ', error);
            notify({ type: 'error', message: 'Failed to update condo' });
            resObj.message = error.message || 'Failed to update condo';
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
                notify({ type: 'error', message: response.message || 'Failed to delete condo' });
                resObj.message = response.message || 'Failed to delete condo';
                resObj.success = false;
            }

            return resObj;
        } catch (error) {
            console.error('Error deleting condo: ', error);
            notify({ type: 'error', message: 'Failed to delete condo' });
            resObj.message = error.message || 'Failed to delete condo';
            resObj.data = item;
            resObj.success = false;
            return resObj;
        }
    };

    const handleFilterChange = async (filters) => {
        try {
            // apply filters to reqData.query.where
            const reqQuery = applyFiltersToPrismaQuery({
                query: {
                    where: {
                        account_id: account ? account.id : null
                    },
                },
                filters
            });

            setIsLoading(true);
            const response = await saGetItems({
                collection: collectionName,
                query: reqQuery
            });

            if (response && response.success) {
                _setData(response.data || []);
            } else {
                notify({ type: 'error', message: response.message || 'Failed to fetch filtered condos' });
            }

        } catch (error) {
            console.error('Error fetching filtered condos: ', error);
            notify({ type: 'error', message: 'Failed to fetch filtered condos' });
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

                if (response && response.success) {
                    _setData(response.data || []);
                } else {
                    notify({ type: 'error', message: response.message || 'Failed to fetch condos' });
                }

            } catch (error) {
                console.error('Error fetching condos: ', error);
            } finally {
                setIsLoading(false);
            }
        };
        body();
    }, []);

    const tableColumns = [
        { key: 'name', title: 'Name', width: 'w-48', required: true },
        { key: 'address', title: 'Address', width: 'w-64', required: true },
        { key: 'city', title: 'City', width: 'w-32', required: true },
        { key: 'state', title: 'State', width: 'w-24', required: true },
        { key: 'zip', title: 'ZIP', width: 'w-24', required: true },
        { key: 'approval_type', title: 'Approval Type', width: 'w-40', required: true },
        { key: 'approval_expiration', title: 'Approval Expiration', width: 'w-40', type: 'date', required: true },
        { key: 'primary_down_pmt', title: 'Primary Down Payment', width: 'w-40', type: 'number', required: true },
        { key: 'secondary_down_pmt', title: 'Secondary Down Payment', width: 'w-40', type: 'number', required: true },
        { key: 'investment_down_pmt', title: 'Investment Down Payment', width: 'w-40', type: 'number', required: true },
        { key: 'source', title: 'Source', width: 'w-32', required: true },
        { key: 'notes', title: 'Notes', width: 'w-48', type: 'textarea' },
    ]

    return (
        <div className="container-main w-full flex flex-col gap-6">
            <h1 className="text-2xl">Condos</h1>

            <div className="w-full relative rounded-md overflow-x-auto">
                <Table
                    account={account}
                    user={user}
                    pathname={pathname}
                    className="card-1 min-w-full"
                    editable={true}
                    editableInline={true}
                    allowAddNew={true}
                    actions={['edit', 'delete']}
                    editRenderOrder={[
                        ['name', 'address'],
                        ['city', 'state', 'zip'],
                        ['approval_type', 'approval_expiration'],
                        ['primary_down_pmt', 'secondary_down_pmt', 'investment_down_pmt'],
                        ['source'],
                        ['notes']
                    ]}
                    tableExcludeKeys={['notes']}
                    columns={tableColumns}
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