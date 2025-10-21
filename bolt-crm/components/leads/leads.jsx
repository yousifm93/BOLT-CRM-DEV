import DetailView from "@/components/leads/detailView";
import { leadStages, leadStatuses } from "@/components/leads/helper"
import LeadListView from "@/components/leads/listView";
import { kebabToCamel } from "@/utils/other";



export default function LeadsEl({ pathname, searchParams, session, user, account }) {

    const pathnameSplit = pathname
        ? pathname.split('/').filter(p => p && p.trim() !== '')
        : [];
    const preStage = pathnameSplit[1] ? kebabToCamel(pathnameSplit[1]) : null;
    const itemId = pathnameSplit[2]
    // const itemId = searchParams && searchParams.itemId ? searchParams.itemId : null;
    const isInvalidStage = !preStage || !leadStages.includes(kebabToCamel(preStage));
    const viewMode = !isInvalidStage
        ? itemId ? 'detail' : 'list' // 'detail' or 'list'
        : 'list';

    // console.log(" ");
    // console.log('====================================');
    // console.log('LeadsEl render ==> ', pathname);
    // console.log('====================================');
    // console.log("LeadsEl pathnameSplit:", pathnameSplit);
    // console.log("LeadsEl Pipeline Stage:", preStage);
    // console.log("LeadsEl Item ID:", itemId);
    // console.log('LeadsEl isInvalidStage ==> ', isInvalidStage);




    console.log(" ");
    if (isInvalidStage) {
        return <div className="container-main">
            <h1 className="text-xl">Invalid Lead Stage</h1>
        </div>
    }

    if (viewMode === 'list') {
        return <LeadListView {
            ...{
                pathname, searchParams, session, user, account,
                stage: preStage,
            }
        } />;
    }
    if (viewMode === 'detail') {
        return <DetailView {
            ...{
                pathname, searchParams, session, user, account,
                stage: preStage,
                itemId
            }
        } />;
    }

    return null;
}