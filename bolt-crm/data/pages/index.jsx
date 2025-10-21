import AuthEl from "@/components/auth"
import VerifyAccount from "@/components/auth/verify";
import LeadsEl from "@/components/leads/leads";
import BoltBot from "@/data/pages/boltBot";
import Condos from "@/data/pages/condos";
import Contacts from "@/data/pages/contacts";
import Credentials from "@/data/pages/credentials";
import DeletedItems from "@/data/pages/deletedItems";
import Emails from "@/data/pages/emails";
import Home from "@/data/pages/home";
import Preapproval from "@/data/pages/preapproval";
import Profile from "@/data/pages/profile"
import Settings from "@/data/pages/settings";
import Tasks from "@/data/pages/tasks";

const pagesMap = [
    {
        pathname: '/',
        Component: (props) => { return <Home {...props} />; },
    },
    {
        pathname: '/profile',
        Component: (props) => { return <Profile {...props} />; },
    },
    {
        pathname: '/settings',
        Component: (props) => { return <Settings {...props} />; },
    },
    {
        pathname: '/elements',
        component: (props) => { return <div className="container-main">pagesMap elements</div> },
    },
    {
        pathname: '/not-found',
        Component: (props) => { return <div className="container-main">pagesMap not-found</div> },
    },
    {
        pathname: '/auth/signin',
        Component: (props) => { return <AuthEl type="signin" {...props} /> },
    },
    {
        pathname: '/auth/signup',
        Component: (props) => { return <AuthEl type="signup" {...props} /> },
    },
    {
        pathname: '/auth/reset',
        Component: (props) => { return <AuthEl type="reset" {...props} /> },
    },
    {
        pathname: '/auth/verify',
        Component: (props) => { return <VerifyAccount {...props} /> },
    },
    {
        pathname: '/tasks',
        Component: (props) => { return <Tasks {...props} /> },
    },
    // Pipeline and its sub-pages
    {
        pathname: '/pipeline/{{LEAD_STAGE}}/{{ITEM_ID}}',
        Component: (props) => { return <LeadsEl {...props} /> },
    },
    {
        pathname: '/contacts',
        Component: (props) => { return <Contacts {...props} /> },
    },
    {
        pathname: '/pipeline/lead',
        Component: (props) => { return <LeadsEl {...props} /> },
    },
    {
        pathname: '/pipeline/pending-app',
        Component: (props) => { return <LeadsEl {...props} /> },
    },
    {
        pathname: '/pipeline/screening',
        Component: (props) => { return <LeadsEl {...props} /> },
    },
    {
        pathname: '/pipeline/pre-qualified',
        Component: (props) => { return <LeadsEl {...props} /> },
    },
    {
        pathname: '/pipeline/pre-approval',
        Component: (props) => { return <LeadsEl {...props} /> },
    },
    {
        pathname: '/pipeline/active',
        Component: (props) => { return <LeadsEl {...props} /> },
    },
    {
        pathname: '/pipeline/past-clients',
        Component: (props) => { return <LeadsEl {...props} /> },
    },
    {
        pathname: '/pipeline/other',
        Component: (props) => { return <LeadsEl {...props} /> },
    },
    {
        pathname: '/resources/emails',
        Component: (props) => { return <Emails {...props} /> },
    },
    {
        pathname: '/resources/bolt-bot',
        Component: (props) => { return <BoltBot {...props} /> },
    },
    {
        pathname: '/resources/condos-list',
        Component: (props) => { return <Condos {...props} /> },
    },
    {
        pathname: '/resources/preapproval-letter',
        Component: (props) => { return <Preapproval {...props} /> },
    },
    {
        pathname: '/admin/credentials',
        Component: (props) => { return <Credentials {...props} /> },
    },
    {
        pathname: '/admin/deleted-items',
        Component: (props) => { return <DeletedItems {...props} /> },
    },

]

export default pagesMap;