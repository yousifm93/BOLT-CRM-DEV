'use client';

import FormBuilder from "@/components/formBuilder";
import { Download, FileSpreadsheetIcon } from "lucide-react";

export default function Preapproval() {



    const handleFormSubmit = (formData) => {
        console.log('Form submitted with data: ', formData);
    }





    return (
        <div className="container-main flex flex-col gap-6">
            <h1 className="text-2xl">Preapproval Letter</h1>


            <div className="card-1 max-w-[800px] flex flex-col gap-8 p-6">

                <div className="flex items-center gap-3 text-2xl ">
                    <FileSpreadsheetIcon className="size-7 fill-yellow-400" />
                    <h2>Preapproval Letter Generator</h2>
                </div>
                <FormBuilder

                    onSubmit={handleFormSubmit}
                    renderOrder={[
                        ['borrowerName', 'LoanAmount'],
                        ['propertyAddress'],
                        ['interestRate', 'loanTerm', 'loanType'],
                        ['expirationDate', 'lenderName'],
                        ['ConditionsAndNotes']
                    ]}
                    fields={[
                        {
                            name: 'borrowerName',
                            autoComplete: 'name',
                            label: 'Borrower Name',
                            placeholder: 'Enter the borrower name',
                            type: 'text',
                            required: true,
                            hidden: false,
                            validator: ''
                        },
                        {
                            name: 'LoanAmount',
                            label: 'Loan Amount',
                            placeholder: 'Enter the loan amount',
                            type: 'number',
                            required: true,
                            hidden: false,
                            validator: ''
                        },
                        {
                            name: 'propertyAddress',
                            autoComplete: 'address',
                            label: 'Property Address (Optional)',
                            placeholder: 'Enter the property address',
                            type: 'text',
                            required: false,
                            hidden: false,
                        },
                        {
                            name: 'interestRate',
                            label: 'Interest Rate',
                            placeholder: '0.00',
                            type: 'number',
                            required: true,
                            hidden: false,
                            validator: ''
                        },
                        {
                            name: 'loanTerm',
                            label: 'Loan Term(Years)',
                            placeholder: 'Select a loan term...',
                            type: 'select',
                            required: true,
                            options: [
                                { value: '15', label: '15 Years' },
                                { value: '20', label: '20 Years' },
                                { value: '25', label: '25 Years' },
                                { value: '30', label: '30 Years' }
                            ],
                            searchable: true,
                            clearable: true
                        },
                        {
                            name: 'loanType',
                            label: 'Loan Type',
                            placeholder: 'Select a loan type...',
                            type: 'select',
                            required: true,
                            options: [
                                { value: 'conventional', label: 'Conventional' },
                                { value: 'fha', label: 'FHA' },
                                { value: 'va', label: 'VA' },
                                { value: 'usda', label: 'USDA' },
                                { value: 'jumbo', label: 'Jumbo' }
                            ],
                            searchable: true,
                            clearable: true
                        },
                        {
                            name: 'expirationDate',
                            label: 'Expiration Date',
                            placeholder: 'Select an expiration date...',
                            type: 'date',
                            required: true,
                            hidden: false,

                            validator: ''
                        },
                        {
                            name: 'lenderName',
                            autoComplete: 'name',
                            label: 'Lender Name',
                            placeholder: 'Enter the lender name',
                            type: 'text',
                            required: true,
                            hidden: false,

                            validator: ''
                        },
                        {
                            name: 'ConditionsAndNotes',
                            label: 'Conditions and Notes',
                            placeholder: 'Enter any conditions and notes',
                            type: 'textarea',
                            required: false,
                            hidden: false,

                            validator: ''
                        },
                    ]}
                    buttons={[
                        <div className="flex items-center gap-3">
                            <div className="btn btn-primary" id="saveBtn" key="saveBtn">
                                +Save Letter
                            </div>
                            <div className="btn btn-secondary" id="saveBtn" key="saveBtn">
                                <Download className="size-5 mr-2" />
                                Generate PDF
                            </div>
                            <div className="btn btn-secondary" id="saveBtn" key="saveBtn">
                                Clear
                            </div>
                        </div>,
                    ]}

                />
            </div>


            <div className="card-1 min-h-60 flex items-center justify-center p-6">
                <div className="opacity-70">
                    <FileSpreadsheetIcon className="size-9 fill-yellow-400 mx-auto" />
                    <span className="">
                        No preapproval letters generated yet.
                    </span>
                </div>
            </div>

        </div>
    );
}