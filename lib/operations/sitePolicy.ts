import {getSettings,getCompany} from '../data.ts';
export function publicSiteBase(){return getSettings().canonicalBase||getCompany().website;}
