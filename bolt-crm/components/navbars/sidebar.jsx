
'use client';

import { SignoutEl } from "@/components/auth";
import {
    BookAudio,
    Calendar,
    ChartPie,
    Check, ChevronRight, ChevronsUpDown,
    Component, File, FileSpreadsheet, FileText, Home, List, ListChevronsUpDown, LogOut,
    LogOutIcon, Menu, Moon, PanelsTopLeft, Rows2,
    Server, Settings, Sparkles, SquareCheckBig, Sun, TableProperties,
    User, User2,
    UserCheck,
    Users,
    Users2Icon,
    Mail,
    Bot,
    LockKeyhole,
    BookX,
    FileSpreadsheetIcon,
    Armchair,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const defaultItems = [
    {
        name: 'Dashboard',
        icon: (props) => <Home {...props} />,
        href: '/',
        subItems: []
    },
    {
        name: 'Tasks',
        icon: (props) => <SquareCheckBig {...props} />,
        href: '/tasks',
        subItems: []
    },
    {
        name: 'Contacts',
        icon: (props) => <Users2Icon {...props} />,
        href: '/contacts',
        subItems: []
    },
    {
        name: 'Pipeline',
        icon: (props) => <ListChevronsUpDown {...props} />,
        href: '/pipeline',
        expanded: true,
        subItems: [
            { name: 'Leads', href: '/pipeline/lead', icon: (props) => <Users {...props} /> },
            { name: 'Pending App', href: '/pipeline/pending-app', icon: (props) => <FileText {...props} /> },
            { name: 'Screening', href: '/pipeline/screening', icon: (props) => <FileSpreadsheet {...props} /> },
            { name: 'Pre-qualified', href: '/pipeline/pre-qualified', icon: (props) => <UserCheck {...props} /> },
            { name: 'Pre-approved', href: '/pipeline/pre-approval', icon: (props) => <SquareCheckBig {...props} /> },
            { name: 'Active', href: '/pipeline/active', icon: (props) => <Calendar {...props} /> },
            { name: 'Past Clients', href: '/pipeline/past-clients', icon: (props) => <ChartPie {...props} /> },
            { name: 'Other', href: '/pipeline/other', icon: (props) => <BookAudio {...props} /> },
        ]
    },
    {
        name: 'Resources',
        icon: (props) => <ListChevronsUpDown {...props} />,
        href: '/resources',
        expanded: true,
        subItems: [
            { name: 'Bolt Bot', href: '/resources/bolt-bot', icon: (props) => <Bot {...props} /> },
            { name: 'Emails', href: '/resources/emails', icon: (props) => <Mail {...props} /> },
            { name: 'Condos', href: '/resources/condos-list', icon: (props) => <Armchair {...props} /> },
            { name: 'Preapproval Letter', href: '/resources/preapproval-letter', icon: (props) => <FileSpreadsheetIcon {...props} /> },
        ]
    },
    {
        name: 'Admin',
        icon: (props) => <ListChevronsUpDown {...props} />,
        href: '/admin',
        expanded: true,
        subItems: [
            { name: 'Credentials', href: '/admin/credentials', icon: (props) => <LockKeyhole {...props} /> },
            { name: 'Deleted Items', href: '/admin/deleted-items', icon: (props) => <BookX {...props} /> },
        ]
    },
]

export default function Sidebar({ items = defaultItems, pathname = '', searchParams, session, user, account }) {

    // console.log('Sidebar render ==> ', pathname);

    // Initialize expanded items with items that have expanded: true
    const getInitialExpandedItems = () => {
        const initialExpanded = new Set();
        items.forEach(item => {
            if (item.expanded === true) {
                initialExpanded.add(item.name);
            }
        });
        return initialExpanded;
    };

    const [expandedItems, setExpandedItems] = useState(getInitialExpandedItems());
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSigningOut, setIsSigningout] = useState(false);

    const toggleExpanded = (itemName) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemName)) {
            newExpanded.delete(itemName);
        } else {
            newExpanded.add(itemName);
        }
        setExpandedItems(newExpanded);
    };


    const isActive = (href) => {
        // if doesnt start with /, add it
        const comparePathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
        let a = comparePathname === href || (href !== '/' && comparePathname.startsWith(href));
        // console.log('isActive check ==> ', a, { href, comparePathname });
        return a;
    };


    const handleThisSignout = async (e) => {
        e.preventDefault();
        setIsSigningout(true);
    }

    // Update expanded items when items prop changes
    useEffect(() => {
        const newExpanded = new Set(expandedItems);
        items.forEach(item => {
            if (item.expanded === true && !newExpanded.has(item.name)) {
                newExpanded.add(item.name);
            }
        });
        setExpandedItems(newExpanded);
    }, [items]);

    // Update CSS variable when collapse state changes
    useEffect(() => {
        try {
            const root = document.documentElement;
            // Use requestAnimationFrame to ensure smooth transition
            requestAnimationFrame(() => {
                if (isCollapsed) {
                    root.style.setProperty('--sidebar-width', '64px'); // collapsed (matches w-16)
                } else {
                    root.style.setProperty('--sidebar-width', '200px'); // expanded (matches w-64)
                }
            });
        } catch (error) {
            // console.error('CSS variable update error ==> ', error);
        }
    }, [isCollapsed]);

    // console.log('Sidebar user ==> ', user);

    const fullName = user && user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : 'n/a';



    if (isSigningOut) {
        return <SignoutEl />;
    };
    if (pathname.startsWith('/auth/')) {
        return null;
    };

    return (
        <div className={`relative h-screen border-r-2 border-gray-200 bg-gray-50 flex flex-col flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
            }`}>
            {/* Header */}
            <div className={`py-6 px-3 overflow-hidden border-b-[1.5px] border-gray-200 ${isCollapsed ? '' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                        <Image
                            src="/images/logos/main.png"
                            alt="Logo"
                            width={35}
                            height={35}
                        />
                        {!isCollapsed && (
                            <div className="text-2xl font-semibold ">
                                <span className="font-light">BOLT</span>
                                <span className="font-bold">CRM</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors absolute -right-10 top-5 transform -translate-y-1/2"
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <PanelsTopLeft className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-2'} overflow-hidden`}>
                <ul className="space-y-2  overflow-y-auto h-[calc(100vh-200px)] slick-scroll">
                    {items.map((item, index) => (
                        <li key={item.name + `-${index}`} className="">
                            <div className="relative ">
                                {/* Main item */}
                                {item.subItems && item.subItems.length > 0 ? (
                                    // Items with submenus - entire item is clickable to expand
                                    <button
                                        onClick={() => toggleExpanded(item.name)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                                            ${isActive(item.href)
                                                ? 'bg-gray-200 text-[var(--primary-foreground)]'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                        title={isCollapsed ? item.name : ''}
                                    >
                                        <item.icon className="w-5 h-5 flex-shrink-0" />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1">{item.name}</span>
                                                <ChevronRight
                                                    className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0
                                                        ${expandedItems.has(item.name) ? 'rotate-90' : ''}`}
                                                />
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    // Items without submenus - regular link
                                    <Link
                                        href={item.href}
                                        className={` flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                            ${isCollapsed ? 'w-fit justify-center' : 'w-full justify-start gap-3'}
                                            ${isActive(item.href)
                                                ? 'bg-gray-200 text-[var(--primary-foreground)]'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                        title={isCollapsed ? item.name : ''}
                                    >
                                        <item.icon className="w-5 h-5 flex-shrink-0" />
                                        {!isCollapsed && <span>{item.name}</span>}
                                    </Link>
                                )}

                                {/* Sub items */}
                                {item.subItems && item.subItems.length > 0 && expandedItems.has(item.name) && !isCollapsed && (
                                    <ul className="mt-2 ml-8 space-y-1">
                                        {item.subItems.map((subItem) => (
                                            <li key={subItem.name}>
                                                <Link
                                                    href={subItem.href}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                                                        ${isActive(subItem.href)
                                                            ? 'bg-gray-100 text-[var(--primary-foreground)]'
                                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                                        }`}
                                                >
                                                    {subItem.icon && <subItem.icon className="w-4 h-4 flex-shrink-0" />}
                                                    <span>{subItem.name}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </li>
                    ))}

                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t-[1.5px] border-gray-200">
                <div className={`flex items-center gap-3 px-3 py-2 ${isCollapsed ? 'justify-center' : ''}`}>
                    {isCollapsed &&
                        <button className="p-1 rounded hover:bg-gray-100" title="Logout" onClick={handleThisSignout}>
                            <LogOut className="w-4 h-4 text-gray-500" />
                        </button>
                    }
                    {!isCollapsed && (
                        <>
                            <div className="bg-gray-200 rounded-full p-1">
                                <User2 className="size-5 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
                                <p className="text-xs text-gray-500 truncate">{session?.email}</p>
                            </div>
                            <button className="p-1 rounded hover:bg-gray-100" title="Logout" onClick={handleThisSignout}>
                                <LogOut className="w-4 h-4 text-gray-500" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}