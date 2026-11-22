# Navajo County, Arizona — Economy & Public Finance, October 2009
Research brief for the county-management game. Compiled 2026-11-21.

**Conventions**
- Every figure has a source link. **[UNVERIFIED]** = could not confirm from a primary/contemporary source, or the source is secondary/later than 2009. **[DERIVED]** = my arithmetic on cited numbers.
- County fiscal year (FY) runs July 1–June 30. "FY2010" = FY2009-10 (the year the game starts in, Oct 2009).
- The single best source is the audited **Navajo County CAFR for FY ended June 30, 2010** (covers exactly FY2009-10): https://www.azauditor.gov/sites/default/files/2023-11/Navajo_County_June_30_2010_Financial_Report.pdf (cited below as **CAFR-2010**). Federal grants come from the **FY2010 Single Audit**: https://www.azauditor.gov/sites/default/files/2023-11/Navajo_Cty_6_30_10_SA.pdf (**SA-2010**). Local copies + text extracts: `/workspace/work/game/research/src/` (c.txt, sa10.txt, s.txt).
- Section 7 (game model) is **design suggestion, not fact**.

---

## 1. County budget FY2009-10

### 1.1 Size
| Item | Amount | Source |
|---|---|---|
| General Fund (GF) **budgeted** expenditures FY2010 (incl. $4.0M contingency) | $45.18M | CAFR-2010 p.80-82 budgetary schedule |
| GF **actual** expenditures FY2010 | $34.03M | CAFR-2010 |
| GF budgeted revenues / actual revenues | $30.43M / $30.09M | CAFR-2010 |
| GF fund balance July 1 2009 → June 30 2010 | $10.43M → $7.74M | CAFR-2010 |
| All governmental funds: revenues / expenditures FY2010 | $68.0M / $66.9M | CAFR-2010 stat. section p.136 |
| All governmental fund balances, June 30 2010 | $41.4M | CAFR-2010 MD&A |
| Government-wide program expenses FY2010 | $70.9M | CAFR-2010 MD&A |
| Total adopted budget (all funds) FY2009-10 | **not found**. FY2008-09 adopted budget was $120.9M (all funds) | FY08-09 budget book: https://www.yumpu.com/en/document/view/28842720/fy0809-budgetbook-navajo-county **[UNVERIFIED for FY2010]** |
| Full-time-equivalent employees | 700 (FY09) → 681 (FY10) | CAFR-2010 p.146 |
| Population 2009 (county est.) | 112,975 (2010 Census: 107,449) | CAFR-2010 p.11, p.144 |

### 1.2 General Fund revenue FY2010 (actual)
| Line | $ | Weekly ($K) [DERIVED ÷52] |
|---|---|---|
| Property taxes | 6,397,385 | 123 |
| Intergovernmental (state-shared sales tax, county sales tax, VLT, PILT, grants) | 20,545,394 | 395 |
| Fines & forfeits | 1,087,357 | 21 |
| Charges for services | 1,012,452 | 19 |
| Licenses & permits | 454,494 | 9 |
| Misc | 519,338 | 10 |
| Investment earnings | 76,000 | 1.5 |
| **Total** | **30,092,420** | **579** |
Source: CAFR-2010 budgetary comparison schedule, GF.

Government-wide general revenue detail FY2010 (CAFR-2010 statement of activities):
- State-shared sales tax **$8.73M** (FY09 $9.84M); county general sales (excise) tax **$5.48M** (FY09 $6.33M; FY08 $7.08M); state-shared vehicle license tax (VLT) **$2.00M**.
- Property taxes by levy: general $6.46M; flood control district $2.74M; public health district $2.15M; library district $0.55M; others ~$0.6M.
- Management: since 2008 state-shared sales tax −18.5%, county sales tax −20%, GF VLT −12.7% (CAFR-2010 transmittal p.13).
- Investment earnings collapsed: $1.62M (FY08) → $0.75M (FY09) → $0.32M (FY10) (CAFR-2010 p.136).

### 1.3 Tax rates
- **Primary property tax rate FY2010: $0.5594 per $100 assessed value** (FY09 $0.5775). Secondary: fire district 0.10, library 0.05, flood control 0.30, public health district 0.1963. **Total county direct rate 1.2057.** (CAFR-2010 p.138)
- Net assessed value FY2010: **$998.8M** (estimated full cash value $8.94B; assessed ≈11.2% of actual). (CAFR-2010 p.137)
- Largest taxpayer: Arizona Public Service (Cholla plant) = **10.75%** of primary assessed value; then PacifiCorp 3.1%, Peabody Western Coal 1.7%, Transwestern Pipeline, El Paso Natural Gas, Catalyst Paper, BNSF (CAFR-2010 p.139).
- **Property-tax cash timing:** levied by 3rd Monday of August; first half due Oct 1 (delinquent after 1st business day of Nov), second half due Mar 1 (delinquent after 1st business day of May). (Navajo CAFR 2012: https://www.azauditor.gov/sites/default/files/2023-11/Navajo_Cty_6_30_12_CAFR.pdf) → Oct 2009 is a property-tax inflow month.
- **Sales tax:** state TPT 5.6% + Navajo County excise 0.5% = **6.10%** retail in county (ADOR rate table eff. Oct 1 2009: https://azdor.gov/sites/default/files/2023-05/200910.pdf — the 6.10% column header is rotated in the PDF; attribution to Navajo inferred from the 5.6%+0.5% structure, see ATRA: https://www.arizonatax.org/sites/default/files/publications/sales_tax_rates/City%20Sales%20Tax%20Rates%20comparisons-3%20decade%20trend-11-21-2024%20updated.pdf). Holbrook city privilege tax 3.00% (same ADOR table) → ~9.1% total in Holbrook. Statutory cap: county general excise ≤10% of state rate (JLBC Tax Handbook: https://www.azjlbc.gov/revenues/25taxbk.pdf).
- **Jail district tax: none in 2009.** Navajo County Jail District excise (≤0.33%) was put to voters only in Aug 2019 (Prop 421 pamphlet: https://storageccec.blob.core.usgovcloudapi.net/public/docs/460-Aug-27-Publicity-Pamphlet-Navajo-County.pdf). Prop 100 (state TPT +1%) started June 2010 — after game start.

### 1.4 State-shared & federal revenues
- **PILT (federal land):** DOI FY2009 payment to Navajo County **$1,418,214** on 615,318 entitlement acres (https://pilt.doi.gov/counties.cfm?term=county&state_code=AZ&fiscal_yr=2009). SA-2010 records **$948,316** PILT expended in FY2010. DOI site shows only $346,772 for FY2010 **[UNVERIFIED — looks like a partial/adjusted record]**. FY2009 CAFR notes a PILT jump after full funding under EESA 2008 (SA-2009: https://www.azauditor.gov/sites/default/files/2023-11/Navajo_Cty_6_30_09_SA.pdf).
- **HURF (gas tax/road money):** Public Works/HURF Fund FY2010 revenue $15.39M (intergovernmental $15.03M incl. grants), road spending $9.89M, fund balance $7.52M → $12.43M (capital projects delayed). Receivable at 6/30/10: $703,804 HURF ≈ one month [DERIVED]. (CAFR-2010 p.83, Note 4.) Statewide FY2009 HURF to counties $222.1M vs $251.9M FY2008, as DPS was shifted onto HURF (JLBC 2009 Tax Handbook: https://www.lincolninst.edu/app/uploads/legacy-files/gwipp/upload/sources/Arizona/2009/az_2009_tax_handbook_joint_legislative_budget_committee_oct_2009.pdf).
- **Federal awards FY2010 total $7.55M** (SA-2010), incl. Schools & Roads (forest receipts) $1.34M, Child Support $0.61M, Homeland Security $0.52M, PHEP (93.069) $0.34M, WIC $0.34M, CDBG $0.36M.

### 1.5 GF expenditure lines FY2010 (actual)
| Line | $ | Weekly ($K) [DERIVED] |
|---|---|---|
| Jail operations | 5,370,488 | 103 |
| Sheriff | 4,862,526 | 94 |
| Juvenile detention | 1,052,456 | 20 |
| Adult + juvenile probation | 940,902 | 18 |
| Indigent health | 2,881,989 | 55 |
| Courts (Superior, Clerk, 6 justice courts) | 5,559,079 | 107 |
| County attorney + public defender + legal defender | 3,375,905 | 65 |
| Other general government (admin, assessor, elections, IT, buildings, treasurer...) | 9,195,088 | 177 |
| Public fiduciary, school supt., capital | ~795,000 | 15 |
| **Total** | **34,033,645** | **654** |
Source: CAFR-2010 GF budgetary schedule. Roads are **not** in the GF (HURF fund ~$190K/wk spend [DERIVED]). Health & welfare government-wide expense FY2010 $9.37M (incl. a new Public Health District facility) (CAFR-2010 MD&A).

### 1.6 Recession measures 2009
- **2.5% salary cut for most employees from July 2009**; new hires at 80% of salary; restored Jan 2012 (Painted Desert Tribune, 2011-12-30: https://www.tribunenewsnow.com/county-employees-salaries-restored/). County framed it as an alternative to furloughs/layoffs (https://www.tribunenewsnow.com/personal-days-no-longer-make-up-for-county-workers-pay-decrease/).
- Cost-saving programme / spending cuts announced Jan 2009 (Supervisor Jesse Thompson column, Navajo-Hopi Observer: https://www.nhonews.com/opinion/county-talk-by-navajo-county-supervisor-jesse-thompson/article_025c0fd0-8f21-5220-b8fc-a8e5ba4ab7f8.html).
- Over FY2009–FY2011: GF spending cut >$8M, three reductions-in-force affecting 27 FTEs, 40 positions frozen/eliminated (Tribune 2011-06-17: https://www.tribunenewsnow.com/state-legislators-asked-to-limit-further-cost-shifts-to-counties). County manager: ">20 employees, 15% of workforce" laid off over 3 years (NPR 2011-04-01: https://www.npr.org/2011/04/01/135047895/facing-budget-deficit-ariz-shifts-costs-to-cities).
- FY2009 GF: actual spend $14.6M under budget; capital outlay deferred $4.7M (SA-2009).
- Budget passed in a "pretty surreal environment" (County Manager James Jayne, White Mountain Independent 2009-11-20: https://www.wmicentral.com/news/navajo_county/county-passes-balanced-budget-despite-surreal-environment/article_87a61704-acfa-533e-8dd3-312ca57f5464.html).

### 1.7 State cost-shifting 2009
- Navajo County ALTCS (long-term care) contribution FY2010 fixed at **$1,965,600** (statewide $190.5M, cut from $262.9M thanks to ARRA FMAP) — Laws 2009, 3rd Special Session, Ch.3: https://apps.azsos.gov/apps/publicservices/LegislativeFilings/PDFs/2009/49th_Legislature_3rd_Special_Session/CH_03.pdf
- FY2010 budget suspended caps on HURF/State Highway Fund money diverted to DPS (House 3rd SS summary: https://www.azleg.gov/alispdfs/49leg/1R/House/summary3ss.pdf).
- Navajo County absorbed **$5.8M** of state cost shifts FY2008–FY2012 (Tribune 2012-06-22: https://www.tribunenewsnow.com/it-was-not-easy-but-county-will-end-year-in-the-black). Statewide counties lost $193.6M FY2008–FY2011 (Brookings Mountain West: https://digitalscholarship.unlv.edu/brookings_pubs/10).
- State FY2010 GF budget $8.67B (JLBC: https://azjlbc.gov/10app/bh2.pdf).

---

## 2. Borrowing, limits and emergency money

### 2.1 Debt actually outstanding (June 30 2010, CAFR-2010 Note 7)
| Instrument | Outstanding | Rate | Notes |
|---|---|---|---|
| Pledged Revenue Obligations Series 2008 (no vote; secured by county excise + state-shared sales tax) | $6.265M | 3.50–4.00% (2008 yields 2.15–4.10%) | Show Low service center, Heber admin bldg. Coverage: debt service = 7.1% of pledged revenue. 2008 OS: https://emma.msrb.org/MD531501.pdf |
| Jail Facility **Certificates of Participation** Series 2000 (lease-purchase via Navajo County Municipal Property Corp.) | $5.03M | 5.00–6.25% | |
| Special assessment debt (improvement districts) | $1.52M | | county "moral commitment" |
| Capital leases | $25K | | |
| **General obligation bonds** | **$0** | | none since at least 2001 |

### 2.2 Tools & legal limits
- **GO bonds:** need majority voter approval at an election; ballot must state amount, max interest rate, purpose and the debt limit (A.R.S. §35-455: http://www.azleg.gov/ars/35/00455.htm; §35-451: http://www.azleg.gov/ars/35/00451.htm).
- **Constitutional debt limit:** CAFR states 15% of net secondary assessed value (Ariz. Const. Art. 9 §8) → **$149.8M FY2010, $136.3M FY2009, fully unused** (CAFR-2010 p.142). Note §35-451 refers to 6% as the threshold above which the article's procedures apply **[the 6%/15% interplay not fully verified]**.
- **Revenue/excise-tax pledged obligations & COPs/lease-purchase:** no election needed (League of Arizona Cities/GFOAZ training: https://www.leagueaz.org/e/25gfoaz_may_training/docs/Alternate_Revenue_Sources.pdf; county examples above).
- **Registered warrants:** when a fund can't pay a warrant, the county treasurer *registers* it; it accrues interest and is paid in order of presentation when cash arrives (A.R.S. §11-605: https://www.azleg.gov/ars/11/00605.htm; §11-635; treasurer manual: https://www.azauditor.gov/sites/default/files/2026-01/UAMACT_0.pdf). **Real 2009 flavour:** in FY2010 Navajo County school districts issued warrants without enough cash and the treasurer used pool money to cover them without formally registering them — an audit finding (SA-2010 finding).
- **Revenue anticipation notes:** treasurer manual references a "special revenue anticipation note redemption fund", A.R.S. §35-467 et seq. (UAMACT above) **[statute text not opened]**.
- **Levy limit:** primary levy may grow max **2%/yr plus new construction** (Ariz. Const. Art. 9 §19: https://www.azleg.gov/const/9/19.htm; A.R.S. §42-17051: https://www.azleg.gov/ars/42/17051.htm). Bond-service levies exempt.
- **Expenditure limit:** spending of local revenues capped at FY1980 base × population × inflation (Art. 9 §20: https://www.azleg.gov/const/9/20.htm). Navajo voters reset the base with **Prop 400 (Nov 2006)** (CAFR-2010 p.13).
- **Budget law:** final budget adopted by 3rd Monday in August and cannot exceed the tentative budget (CAFR-2010 p.12) → mid-year increases are hard; the $4M GF "contingency" line is the real buffer.
- **Credit rating:** CAFR says "no significant changes to the County's credit ratings" but the 2009 rating itself was **not found**. (S&P rated 2021 excise-tax bonds AA: https://www.azauditor.gov/sites/default/files/2025-02/NavajoCountyJune30_2024FinancialReport.pdf.)

### 2.3 Savings / investment
- **County Treasurer's pool:** $132.5M (July 1 2009) → $141.7M (June 30 2010), of which county's own ~$36M; holdings at 6/30/10: US agencies 1.125–3.75%, repos **0.10%**, corporate 1.625%, Treasury MMF 0.02% (CAFR-2010 Note 12). Most county cash sits here, not in LGIP.
- **State Treasurer LGIP (Pool 5):** average yield **0.44% FY2009, ~0.2% FY2010** (Auditor General highlights, unaudited chart: https://www.azauditor.gov/sites/default/files/2023-11/AZ_Treasurer_6_30_10_Financial_Rpt_Highlights.pdf and FY2011: https://www.azauditor.gov/sites/default/files/2023-11/AZ_Treasurer_6_30_11_Financial_Rpt_Highlights.pdf). City of Cottonwood memo June 2009: LGIP "currently at only 0.27%" (https://cottonwoodaz.gov/Archive/ViewFile/Item/241). → **Oct 2009 realistic yield ≈0.2–0.3%**, lower than the 0.5% in the brief.

### 2.4 Emergency money
- **Governor's Emergency Fund (A.R.S. §35-192):** Governor may commit **$200,000 per event**; more needs State Emergency Council majority; aggregate **$4M per FY** (https://www.azleg.gov/ars/35/00192.htm; DEMA: https://dema.az.gov/resources/state-emergency-council). **FY2010 funding cut by $1.1M to $2.9M** (JLBC FY2010 Appropriations Report: https://azjlbc.gov/10app/ema.pdf). FY2010 used it for Sedona flash flood (Sep 2009) and the **Jan 2010 winter storm that included Navajo County** (DEMA FY2010 report: https://dema.az.gov/sites/default/files/2022-09/RES_SEC_FY2010_Report.pdf; $4.02M allocated: https://www.azauditor.gov/sites/default/files/2023-11/22-114_Report.pdf).
- **Stafford Act/FEMA Public Assistance:** federal share **not less than 75%** of eligible costs; non-federal 25% borne by state and/or locals (CRS: https://www.congress.gov/crs-product/R46749; FEMA PAPPG). Real near-future event: **FEMA-3307-EM (Jan 24 2010)** for Navajo Nation/Hopi and **FEMA-1888-DR (Mar 18 2010)** (DEMA GEF report: https://dema.az.gov/sites/default/files/2025-12/GEF_FY24_Report.pdf). Arizona's exact split of the 25% with counties **[UNVERIFIED]**. Reimbursement lag **not sourced** (design assumption in §7).
- **H1N1 PHER (CDC 93.069):** $1.4B nationwide to 62 state/large-city grantees in phases; Phase I from July 31 2009, **Phase III ($846M) for mass vaccination available from Sept 28 2009** (CDC: http://medbox.iiab.me/modules/en-cdc/www.cdc.gov/phpr/readiness/funding-h1n1.htm). Counties got it as pass-through from ADHS; Navajo County's FY2010 PHEP line was $335,911 (SA-2010) — the PHER share inside it **[UNVERIFIED]**. Pima County's whole H1N1 response cost $722K, offset by PHER (https://oldcms.pima.gov/UserFiles/Servers/Server_6/File/Health/Health%20Data,%20Statistics%20and%20Reports/After%20Action%20Report-Improvement%20Plan%20%282009%20H1N1%20Flu%20Response%29.pdf).
- **ARRA to Navajo County (expended FY2010, SA-2010) ≈ $1.33M [DERIVED sum]:** Byrne JAG $402,593 + $58,267; rural law enforcement $119,217; WIA adult/youth/dislocated $307,967; Energy Efficiency Block Grant $207,040; State Fiscal Stabilization (education) $217,271; IDEA $20,768. Plus indirect ARRA relief via lower ALTCS contribution (above).

### 2.5 Navajo Nation finances (for tribal-government actors)
- **Permanent Trust Fund:** created 1985 (seed ~$26M), 12% of projected revenue deposited yearly; ~"nearly $1 billion" Feb 2008 (Indianz: https://indianz.com/News/2008/02/12/navajo_presiden.asp); ~$1.2B in 2012 (Navajo Times: https://navajotimes.com/news/2012/1012/101112tru.php). Income locked 20 years; spending needs a 5-year plan the Council had not adopted (same).
- **Undesignated Unreserved Fund Balance (UUFB):** 2008 audit showed it **negative ~$18M**; law requires ≥$15M; FY2009 GF shortfall projected $12.8–13.5M, FY2010 $15.4M (Navajo-Hopi Observer 2009-08-05: https://www.nhonews.com/features/vice-president-shelly-reports-nation-seeking-stimulus-funding/article_40100b32-fdca-5ccf-80f0-5601232d6075.html; ICT 2009-07-15: https://ictnews.org/archive/navajo-president-vetoes-10-million-spending-bill/). FY2010: $4M unmet need, 50 positions to be abolished (https://www.nhonews.com/features/navajo-council-to-decide-on-funding-issue/article_f8bc550b-e342-510e-a035-609a21e4852d.html).
- **Revenue sources FY ended 9/30/2009 (actual):** coal **$68.0M**, oil & gas **$29.5M** (Navajo Nation revenue exhibit attached to CS-48-13: https://nnva.navajo-nsn.gov/Portals/0/LEGISLATION%20WEBPAGE/Legislation%20Downloads/CS-48-13.pdf). External (federal/state/grant) budget 2009 ≈ $408M (High Country News: https://www.hcn.org/issues/43-14/navajo-monster-slayers-a-tribe-struggles-to-fight-corruption-while-keeping-its-traditions/). Coal: Peabody Kayenta mine operating; Black Mesa mine had closed with Mohave plant (~$29M/yr royalties lost) (Indianz: https://indianz.com/News/2009/06/11/navajo_nation_loses_millions_i.asp — closure was end-2005 **[date from memory, unverified]**). Supreme Court ended $600M royalty suit Apr 6 2009 (https://www.nhonews.com/news/navajo-nation-denied-coal-royalties-for-second-time/article_0255f539-5138-5618-ae97-7dcc86a81622.html). NTEC did not exist in 2009 (per brief).

### 2.6 LDS welfare system
- **Bishops' storehouse in Snowflake** (listed at 641 S Main St / 300 W 3rd St S; current listings: https://www.mapquest.com/us/arizona/bishops-storehouse-448239357, https://www.namesandnumbers.com/biz/297925/lds-snowflake-bishop-storehouse) **[existence in 2009 unverified]**. Access is by bishop's order, free to recipient.
- **Precedent:** during the 2002 Rodeo-Chediski fire the Mesa bishops' storehouse dispatched a semi-trailer of food, tents, sleeping bags and generators within an hour; ~15,000 regional residents were LDS (Church newsroom: https://newsroom.churchofjesuschrist.org/article/arizona-church-members-fire-victims).
- **Deseret Industries:** none in Navajo County; Arizona stores were in the Phoenix and Tucson areas (Gilbert in 2018 was AZ's 4th, after Mesa, Glendale, Tucson: https://www.thechurchnews.com/2018/10/24/23214375/how-deseret-industries-looks-at-products-and-people-without-labels). 49 DI stores in 7 states as of 2009 (Church News: https://www.thechurchnews.com/2010/2/2/23268855/united-states-information-utah/).
- Fast offerings: monthly fast, cost of two meals donated via bishop **[general knowledge, not sourced]**.

---

## 3. Banks and interest rates

### 3.1 Banks
| Bank | Branch(es) | 2009 evidence |
|---|---|---|
| Wells Fargo | Holbrook 266 Navajo Blvd (est. 1968); Winslow 210 W 2nd St (est. 1962; deposits $21.9M Jun 2009); also Snowflake, Pinetop, Kayenta, Whiteriver | https://www.bankbranchlocator.com/wells-fargo-bank-holbrook-az-branch.html ; https://bankbranches.org/branch/225303 |
| National Bank of Arizona (Zions) | Show Low 1400 E Woolford (est. 1983) | https://www.bankbranchlocator.com/national-bank-of-arizona-show-low-branch.html |
| Bank of the West | Holbrook 156 W Hopi Dr; Winslow 300 Williamson Ave | https://www.banks411.com/arizona/holbrook/ **[2009 presence unverified]** |
| Chase, Bank of America, Washington Federal, Compass | Show Low / Lakeside | https://www.bank-locations.net/banks-in-show-low-az/ ; https://www.search-banks.com/county/Navajo **[2009 presence unverified]** |
| Credit unions | **not researched — gap** | |

### 3.2 Rates, October 2009
| Rate | Value | Source |
|---|---|---|
| Fed funds target / effective | 0–0.25% / ~0.12% | Fed H.15 Oct 13 2009: https://www.federalreserve.gov/releases/h15/20091013/h15.htm |
| Prime | 3.25% | Economic Indicators Oct 2010: https://www.govinfo.gov/content/pkg/ECONI-2010-10/pdf/ECONI-2010-10-Pg30.pdf |
| 3-mo T-bill / 10-yr Treasury (Oct avg) | 0.08% / 3.39% | same |
| 30-yr fixed mortgage (Freddie Mac) | 4.94% (10/1), 4.87% (10/8, near record low), 4.92%, 5.00%, 5.03% (10/29) | https://fred.stlouisfed.org/data/MORTGAGE30US |
| Bank CDs | 1-yr avg ~1.08% (2009 avg, FDIC/RateWatch via secondary site: https://safemoney.com/blog/financial-education/average-bank-cd-rates-last-ten-years/); Bankrate: <1% APY by Sept 2009 (https://www.bankrate.com/banking/cds/historical-cd-interest-rates/) **[secondary]** | |
| Secondary-market 3-mo CDs | 0.24% | Fed H.15 above |
| Muni GO 20-yr (Bond Buyer 20) | **4.20% Oct 2009 avg**; 2009 low 3.94% on Oct 1 | FRED MSLB20: https://fred.stlouisfed.org/data/MSLB20 ; Bond Buyer: https://data.bondbuyer.com/MarketStatisticsArchive/DisplayReport/83 |
| High-grade muni (S&P) Oct 2009 | 4.20% | Economic Indicators above |
| Bond Buyer 1-yr note index | ~0.5% (0.56% Nov 24 2009) | https://www.bondbuyer.com/news/most-bond-buyer-indexes-rise-this-week-bb1010611 |
| Revenue bond index 2009 | avg 5.44%, low 4.69% (Oct 1) | Bond Buyer archive above |

---

## 4. Prices, October 2009

### 4.1 Fuel & energy
| Item | Price | Source |
|---|---|---|
| Gasoline regular, Arizona, Oct 2009, **incl. taxes** | **$2.38/gal** (Sep $2.51, Nov $2.52) | FHWA MF-5: https://www.fhwa.dot.gov/ohim/mmfr/dec09/rpmfuel2.cfm |
| Same, excl. taxes | $2.017 | EIA PMM: https://www.eia.gov/petroleum/marketing/monthly/archive/2010/2010_02/txt/tables28.txt |
| AZ 2009 annual avg (AAA) | $2.31 | https://www.eastvalleytribune.com/news/average-gas-price-down-28-in-2009-vs-2008/article_7c2d7988-05f4-5913-8a67-5e6463654ad1.html |
| Diesel, US weekly Oct 2009 | $2.58 → $2.80 (spike late Oct) | https://weeklydiesel.com/history/2009 (EIA data) |
| Diesel, regions | Rocky Mtn $2.65 (Oct 5) → $2.78 (Oct 26); West Coast $2.73 → $2.90 | EIA TWIP: https://www.eia.gov/petroleum/weekly/archive/2009/091028/twipprint.html ; https://www.eia.gov/petroleum/weekly/archive/2009/091015/twipprint.html. Rocky Mtn monthly Oct $2.694: https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=m&n=pet&s=emd_epd2d_pte_r40_dpg |
| Propane, residential | US $1.991/gal Oct 2009 (low $1.94 Oct 5); West (PADD V) 193.7¢ excl. tax | https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=M&n=PET&s=M_EPLLPA_PRS_NUS_DPG ; https://www.eia.gov/petroleum/marketing/monthly/archive/2010/2010_02/txt/tables34.txt |
| Electricity / piped gas (US avg) | 12.6¢/kWh; $1.048/therm | BLS chart below |

### 4.2 Food (US city average, BLS average prices, Oct 2009)
Milk whole **$3.046/gal**; white bread **$1.392/lb**; eggs grade A large **$1.595/doz**; ground chuck **$2.785/lb**; whole chicken $1.244/lb; bananas $0.598/lb; gasoline $2.561/gal. Source: https://www.bls.gov/charts/consumer-price-index/consumer-price-index-average-price-data.htm (also CPI Detailed Report Oct 2009 table P4 with West region: https://fraser.stlouisfed.org/files/docs/publications/cpidr/cpi_200910.pdf). No Holbrook-specific price series exists.

### 4.3 Housing, income, wages
| Item | Value | Source |
|---|---|---|
| Median household income, 2009 | **$34,855** (AZ $48,711) | Census SAIPE 2009: https://www2.census.gov/programs-surveys/saipe/datasets/2009/2009-state-and-county/est09all.xls |
| Poverty 2009 (SAIPE) / ACS 2005-09 | **27.4%** / **24.6%** | SAIPE above; Census: https://www.census.gov/content/dam/Census/library/stories/2026/02/high-poverty-rates/counties-acs-sustained-poverty.pdf |
| Median rent / home value ACS 2005-09 | **not retrieved** (Census API needs key) — gap | |
| Arizona minimum wage 2009 | **$7.25** (held for 2010) | Industrial Commission: https://www.azica.gov/sites/default/files/LABOR_minimum_wage_2010.pdf |
| County employee pay | 2.5% cut July 2009; chief deputy sheriff salary $90,000 from FY2009-10 | Tribune (above); https://www.tribunenewsnow.com/salaries-for-top-appointed-officials-in-county-are-up-200000-from-06 |
| **BLS OES May 2009, "North Arizona nonmetropolitan area"** (the BLS area containing Navajo County **[area membership assumed]**) — annual mean | Police & sheriff patrol $43,640; correctional officer $35,770; RN $61,560; LPN $43,960; EMT/paramedic $31,570; firefighter $30,870; nursing aide $26,250; heavy truck driver $37,400; construction laborer $28,910; all occupations $34,810 | BLS file oesm09ma.zip (BOS_M2009_dl.xls): https://www.bls.gov/oes/special-requests/oesm09ma.zip |

### 4.4 Lodging
Wigwam Motel, Holbrook: $42 (1 bed) / $48 (2 beds) + tax in Jan 2006 (Route 66 News: https://www.route66news.com/2006/01/16/wigwam-hospitality/); ~$58 double around 2008 (blog: https://theprivateoperative.wordpress.com/2013/01/05/holbrook-arizona-route-66s-forgotten-town/). **Oct 2009 rate ≈ $50–58 [UNVERIFIED estimate].**

### 4.5 Emergency goods
| Item | Price / status | Source |
|---|---|---|
| FEMA travel trailer (new, bulk 2005-06) | ~$19,000 avg incl. mobile homes ($2.7B / 145,000 units); trailers ~$13–14K, mobile homes ~$30K | AP via Inquirer: https://www.inquirer.com/philly/news/special_packages/inquirer/katrina/20070308_FEMA_to_auction_off_trailers__raising_storm_among_dealers.html ; Sun Journal: https://www.sunjournal.com/2007/05/17/hurricane-katrina-trailers-fema-sale-cheap |
| Surplus FEMA trailers (formaldehyde-tainted) | GSA auction Jan 2010: ~102,000 units for ~$139M (~$1,360 each [DERIVED]); Hope AR lot ~$1,825 avg | House hearing: https://www.govinfo.gov/content/pkg/CHRG-111hhrg76569/html/CHRG-111hhrg76569.htm ; https://www.magnoliareporter.com/news_and_business/local_news/article_dc6fea0a-52d6-11df-80b7-001cc4c002e0.html |
| Full cost of FEMA trailer housing | >$100,000 per family for 18 months incl. group sites | DHS IG July 2009: https://www.oig.dhs.gov/sites/default/files/assets/TM/OIGtm_RLS_070809.pdf |
| Portable/modular classroom | Temporary $25–30/sq ft; permanent modular $75–85 (2006); lease example $850/mo for 900 sq ft (FY07); 8 leased modulars $433,472 (PA, Jan 2009) | https://spaces4learning.com/articles/2006/04/01/instant-classrooms.aspx?Page=2 ; https://www.hopedale-ma.gov/DocumentCenter/View/515/School-Department---Fiscal-Year-2009 ; https://www.thereporteronline.com/2009/01/14/modulars-on-the-way/ |
| Modular clinic | **no 2009 price found**; use classroom $/sq ft as proxy **[UNVERIFIED]** | |
| **N95 respirators** | State contract 3M 8210: **$14.37 / box of 20 (~$0.72 each)**, price list re-sent 10/29/09; retail Moldex 1500 $27.99/box of 20 (Sept 2009). **Shortage:** DHS Oct 2009 — 4 of 10 HHS regions reporting N95 shortages; new customers allocated; 2–3 yr backlog | https://dam.assets.ohio.gov/image/upload/procure.ohio.gov/pricelist/800086pricelist.pdf ; https://www.1888pressrelease.com/moldex-1500-n95-swine-flu-h1n1-respirator-masks-now-in-sto-pr-151051.html ; https://info.publicintelligence.net/DHS%20H1N1%20Weekly%20Sitrep%2010_10%20thru%2010_16.pdf ; https://www.liebertpub.com/doi/10.1089/hs.2016.0129 |
| **H1N1 vaccine supply (Arizona)** | First 60,000 doses ordered Sept 30 2009 (mostly nasal FluMist); expected 0.8–1M by mid-Oct but only **263,300 shipped by Oct 21** and 332,800 by ~Oct 28; 1.08M by Nov 24; 2.15M by Dec 23. Vaccine free (federally purchased), allocated pro-rata by population | ADHS: https://www.azdhs.gov/documents/director/public-information-office/news-releases/2009/090930-arizona-orders-2009-h1n1-vaccine-for-state.pdf ; CDC: https://archive.cdc.gov/www_cdc_gov/h1n1flu/vaccination/updates/102309.htm , .../112509.htm , .../122409.htm ; Daily Wildcat: https://wildcat.arizona.edu/127225/news/h1n1-vaccine-scarce-in-arizona/ |

---

## 5. Supplies & logistics
- **Fuel:** Western Refining's **Gallup NM refinery (23,000 bpd)** trucks product into NE Arizona; its **Flagstaff terminal (12,000 bpd, 65,000 bbl tankage) is supplied by truck from Gallup**; the Bloomfield NM refinery (17,000 bpd) was **indefinitely idled late Nov 2009** (Western Refining 2009 10-K: https://www.sec.gov/Archives/edgar/data/1339048/000095012310023725/d71428e10vk.htm). Phoenix/Tucson get product via Kinder Morgan East Line from El Paso and the Colton–Phoenix line (Kinder Morgan: https://www.kindermorgan.com/WWWKM/media/Documents/2025-March-Pacific-ops-brochure.pdf). **No fuel terminal in Navajo County found** → fuel arrives by truck on I-40 (from Gallup ~90 mi east) or from Phoenix/Flagstaff **[distances general knowledge]**.
- **Rail:** BNSF Transcon through Winslow/Holbrook; BNSF Winslow is a major employer (CAFR-2010 p.12, 145).
- **Groceries:** Safeway Holbrook (702 W Hopi Dr; in Aug 2009 it donated 5,400 gal of water to reservation communities with the Sheriff: https://www.nhonews.com/features/navajo-county-thanks-holbrook-safeway/article_8e3ed32a-d5ba-5904-b8d0-6141bda65668.html); Safeway Winslow and Show Low; **Walmart Supercenter Winslow** (opened Oct 2006, 159,000 sq ft: https://www.nhonews.com/archives/wal-mart-supercenter-brings-new-level-of-commerce-to-winslow/article_10484701-edc9-5cdc-ab01-26b896051f5b.html); **Walmart Supercenter Show Low** (store #1230, supercenter ~1998–99: https://azdailysun.com/show-low-super-wal-mart-sets-example-for-page/article_5bafa3ed-a72a-5a51-bb8a-16e1ff3df0bd.html); **Bashas' Winslow (1500 N Park Dr) closed Oct 10 2009** (https://malls.fandom.com/wiki/Bashas%27/Locations **[wiki source]**); Bashas' Diné Markets on the reservation; Bashas' DC is in Chandler (700,000 sq ft, 2005: https://progressivegrocer.com/cover-story-retailer-year-growing-bashas). **No Walmart distribution center in Navajo County found** — gap.
- **Power:** **Cholla Power Plant**, Joseph City — 4 units, **1,027 MW net**, coal delivered by train (EPA 2009 assessment: https://www3.epa.gov/epawaste/coal/pdf/aps_cholla_final.pdf); coal from NM mines by BNSF; McKinley mine closed 2009 (https://en.wikipedia.org/wiki/Cholla_Power_Plant **[wiki]**); 19-yr, up to 4 Mt/yr contract from Peabody El Segundo from 2008 (https://tucson.com/business/new-mexico-coal-mine-starts-feeding-tep-plant/article_a0ab9ae5-f9be-5e80-b371-a64923ce7506.html). ~249 employees, $29M payroll (2014: https://www.pinnaclewest.com/newsroom/company-news/news-release-details/2014/APS-Proposes-Compromise-for-Cholla-Power-Plant/default.aspx).
- **Propane dependence on reservation:** **not sourced** — gap (could use ACS house-heating-fuel table B25040 later).
- **Water:** Holbrook and Winslow rely **entirely on C-aquifer groundwater** (ADWR Arizona Water Atlas vol. 2, 2009: https://infoshare.azwater.gov/docushare/dsweb/Get/Document-10427/Volume_2_final_web.pdf); C-aquifer also serves Navajo Nation and 3 regional power plants (USGS: https://pubs.usgs.gov/of/2021/1051/ofr20211051.pdf). ~30% of Navajo households lack public water and haul it (Navajo DWR 2011: https://www.frontiernet.net/~nndwr_wmb/PDF/Reports/DWRReports/DWR2011%20Water%20Resource%20Development%20Strategy%20for%20the%20Navajo%20Nation.pdf). 54% of county residents rural, many on residential wells (UA WRRC: https://wrrc.arizona.edu/sites/default/files/2026-02/Navajo_Factsheet_02_2026.pdf).
- **Hospitals:**
  | Facility | Beds | Source |
  |---|---|---|
  | Summit Healthcare Regional Medical Center, Show Low | 101 licensed | https://summithealthcare.net/ |
  | Little Colorado Medical Center, Winslow | 25 (Critical Access since Nov 2004) | https://lcmcwmh.com/about-us |
  | Winslow Indian Health Care Center | **0 — outpatient only since 1977** (tribal 638 since 2002) | https://www.wihcc.com/history-mission-vision--values.html |
  | Whiteriver IHS Hospital (Fort Apache) | 40 | https://www.ihs.gov/Phoenix/healthcarefacilities/whiteriver |
  | Hopi Health Care Center, Polacca | 15 (CAH) | AHRF via https://rhtcompass.com/az/counties/navajo **[current data]** |
  | Kayenta (IHS) | 10 short-stay beds | https://navajofamilies.org/facilities.html **[current data]** |
  Bed counts are current-day figures; 2009 counts **[UNVERIFIED]**.

---

## 6. Economy structure
- **Land:** ~66% of 9,949 sq mi is reservation (Navajo, Hopi, White Mountain Apache); 18% private, 9% USFS/BLM, 5.9% state (Navajo County: https://www.navajocountyaz.gov/213/About-Navajo-County).
- **Population:** 112,975 (2009 est.); American Indian 43.4% in 2010 Census (https://www.azcensus.com/wp-content/uploads/2019/12/Navajo-County-Census-2010.pdf); PEP estimate 46.1% for 2009 (https://www.indexmundi.com/facts/united-states/quick-facts/arizona/county/navajo/american-indian-and-alaskan-native-population-percentage **[secondary]**).
- **Unemployment (not seasonally adjusted), 2009:** Jan 14.3%, Jun 15.4%, Sep 15.1%, **Oct 15.7%**, Dec 16.4%; annual 15.0%; labour force ~40,300, ~6,300 unemployed in Oct. Arizona Oct 2009: 10.4% (Arizona OEO LAUS: https://oeo.az.gov/sites/default/files/data/laus/laus-nsa-04cnt-2000to2009.pdf ; https://oeo.az.gov/sites/default/files/data/laus/laus-nsa-st-2000to2009.pdf). The CAFR printed 14.9% for 2009 (older vintage).
- **Employment by sector (nonfarm, 2008 → 2010):** Government 10,800 → 10,125; Trade/transport/utilities 5,725 → 5,125; Educ & health 3,425 → 3,475; Leisure & hospitality 2,975 → 3,225; Mining & construction 2,525 → 1,400; Prof/business 1,225 → 1,000; Information 800 → 1,125; Manufacturing 725 → 525; Financial 600 → 425; Other 625 → 650 (CAFR-2010 p.145).
- **Major employers:** Catalyst Paper (Snowflake mill), APS Cholla (Joseph City), BNSF (Winslow), Summit Healthcare, Northland Pioneer College, Navajo Nation government, Peabody Kayenta mine, PFFJ hog farm (Snowflake), Walmart Show Low, Bashas' Taylor, Safeway Pinetop, Kayenta BIA school, Keams Canyon IHS, NTUA, Navopache Electric, Pinon USD, Western Moulding, Tate's Auto (CAFR-2010 p.145). Principal industries: tourism, coal mining, manufacturing, timber, ranching (CAFR-2010 p.11).
- **Personal income:** per capita $22,613 (2008) (CAFR-2010 p.144).
- **Tourism:** Petrified Forest NP **631,613 recreation visits in 2009** (+16% vs 2008); Nov 2009 30,016; Dec 19,898 (NPS: https://www.nps.gov/pefo/learn/news/increase-in-visitation-for-2009-at-petrified-forest-national-park.htm ; ranking: https://npshistory.com/publications/visitation/annual-park-ranking/2009.pdf).
- **Ranching (2007 Census of Agriculture):** Navajo County cattle & calves inventory ~27,500 head on ~1,756 farms (table parsing of https://www.nass.usda.gov/AgCensus/archive/files/2007-Arizona-st04_2_011_011.pdf is ambiguous — **[UNVERIFIED]**); goats 11,375 on 994 farms (https://www.nass.usda.gov/AgCensus/archive/files/2007-Arizona-st04_2_017_019.pdf); 2017: 29,746 cattle, 47,767 sheep (https://www.nass.usda.gov/Publications/AgCensus/2017/Online_Resources/County_Profiles/Arizona/cp04017.pdf). Arizona cattle value $1,120/head Jan 2008 (https://www.nass.usda.gov/Statistics_by_State/Arizona/Publications/Annual_Statistical_Bulletin/historical_bulletins/2007/2007FullBulletin.pdf).

---

## 7. DESIGN SUGGESTION — compact game economy (not historical fact)

### 7.1 Units & clock
- Currency unit **$K (thousand USD, 2009 dollars)**. Tick = 1 week. Start: week of Oct 5 2009 (FY2010 week 14).
- Starting cash: GF **$10,400K** (July 1 2009 balance) minus Q1 burn → ~**$9,400K** on Oct 1 [DERIVED from 13 weeks × (654−579)]. Restricted pots shown separately: Roads/HURF $7,500K (roads only), Flood Control ~$7,000K (FY09 balance $6.94M, levee-earmarked), Public Health District (own levy ~$41K/wk).

### 7.2 Weekly baseline lines (from FY2010 actuals ÷ 52)
**Revenue (GF ≈ $579K/wk avg)**
| Line | $K/wk | Behaviour |
|---|---|---|
| Property tax | 123 avg → **pay as lump**: ~48% in Oct–Nov (≈$385K/wk for 8 wks), ~48% Mar–May, trickle otherwise | cut by delinquency rises with unemployment |
| State-shared sales tax | 168 | follows statewide economy index (−10%/yr trend in 2009) |
| County 0.5% excise tax | 105 | follows **local** retail activity (tourism, Walmart/Safeway open, fuel availability) |
| VLT | 38 | slow-moving |
| PILT | ~$950K once/yr in June | federal |
| Fees, fines, charges, misc | 60 | scales with court/sheriff activity |
| Interest | 1.5 | = cash × pool yield |
**Expense (GF ≈ $654K/wk)**
| Line | $K/wk | Levers |
|---|---|---|
| Jail ops | 103 | +$X per inmate; cost-shift events |
| Sheriff | 94 | overtime in crises (+30–50%) |
| Courts | 107 | |
| Attorney/defence | 65 | |
| Indigent health + ALTCS share | 55 + 38 ($1,966K/yr) | spikes in epidemic |
| Juvenile det./probation | 38 | |
| Admin & other gov't | 177 | 2.5% pay-cut lever already applied; layoffs −$1.2K/wk per FTE (avg $60K loaded [ASSUMPTION]) |
| Contingency | 0 until spent; capped at $4,000K/yr | |
| Roads (HURF fund) | 190 spend vs 296 inflow | separate pot |
Structural gap ≈ **−$75K/wk** → player must cut, borrow or find grants (matches the real FY2010 −$2.7M GF drawdown).

### 7.3 Borrowing menu (real-ish terms)
| Option | Size | Rate | Delay / gate | Notes |
|---|---|---|---|---|
| Registered warrants | any shortfall | 2.0% [ASSUMPTION] | instant | each week unpaid → vendor/staff morale hit; audit finding risk |
| Interfund loan from Flood Control / HURF | ≤50% of balance | 0% | 1 wk, Board vote | must repay by FY end; HURF limited to road-related use [ASSUMPTION on legality] |
| Revenue anticipation note | ≤50% of expected property tax | 1.5% (1-yr note index ~0.5% + spread) | 4 wks | repaid from Mar–May tax |
| Pledged revenue obligation (excise-tax backed) | ≤ ~$10M; debt service ≤ 25% of pledged sales tax | 3.75% / 15 yrs (2008 deal 3.5–4.1%) | 8–10 wks (bond counsel) | no vote |
| COPs / lease-purchase | per facility (jail, clinic) | 4.5–5.5% / 10–20 yrs | 10 wks | asset is collateral |
| GO bond | up to $149.8M (15% of AV) | 4.2% (Bond Buyer 20, Oct 09) / 20 yrs | needs **election**: next Nov or Mar/May date; 50% approval scaled by public trust | adds secondary levy (outside 2% cap) |
| Governor's Emergency Fund | $200K auto; up to $1–2M with Council | grant | 1–2 wks after local declaration | statewide pot only $2.9M in FY2010 — competing counties |
| FEMA Public Assistance | 75% of eligible costs | grant | needs Presidential declaration (damage threshold); reimbursement lag 12–26 wks [ASSUMPTION] | 25% local/state match |
| CDC PHER (via ADHS) | ~$50–300K tranches [ASSUMPTION scaled from county PHEP $336K/yr] | grant | Phase III money live from Sept 28 2009 | must spend on vaccination/surveillance |
| ARRA grants | JAG ~$460K, EECBG $207K, WIA $308K | grant | already flowing | strings: reporting (1512) audits |
| Navajo Nation / LDS storehouse | in-kind food/water/shelter | — | political/relationship gated | Nation itself cash-strapped (UUFB −$18M) |

### 7.4 Savings
- Treasurer pool yield **0.25%/yr** (LGIP 0.2–0.44%) → weekly interest = cash × 0.0025/52. Optional "ladder US agencies" at 1.5% with 2-yr lock and fair-value risk.

### 7.5 Price index
- Local Price Index **LPI = 100 at Oct 2009**. Per category c: `P_c(t) = P_c0 × (1 + k_c × max(0, D−S)/D) × (1 + τ)`, with shortage elasticity k = 0.5 food, 1.0 fuel, 3.0 N95/medical, 0.3 lodging; τ = transport surcharge (+10% per week I-40 closed, +25% if Gallup/Flagstaff supply cut). LPI = weighted avg (food 40, fuel 25, shelter 20, medical 10, other 5). County sales-tax receipts scale with LPI × volume (inflation helps revenue a little; shortages hurt volume more).

### 7.6 Supply categories (real Oct-2009 base prices)
| # | Category | Unit | Base price | Source row |
|---|---|---|---|---|
| 1 | Gasoline | gal | $2.38 | §4.1 |
| 2 | Diesel | gal | $2.75 | §4.1 (Rocky Mtn/West avg) |
| 3 | Propane (heating) | gal | $2.00 | §4.1 |
| 4 | Food ration (1 person-day ≈ 1 gal milk/4 + 0.5 lb bread + 2 eggs + 0.33 lb beef + staples) | person-day | ≈$4.50 [DERIVED/ASSUMPTION] | §4.2 |
| 5 | Potable water (hauled/bottled) | 1,000 gal | $50 [ASSUMPTION] | no source |
| 6 | N95 respirator | box of 20 | $14.37 contract / $28 retail; availability-capped | §4.5 |
| 7 | H1N1 vaccine | dose | $0 (federal), supply-capped: county pro-rata ≈1.7% of AZ shipments [DERIVED from 112,975 / ~6.6M AZ pop] → ~4,500 doses by Oct 21, ~18,000 by Nov 24 | §4.5 |
| 8 | Travel trailer (emergency housing) | unit | $14,000 new / $1,500 surplus (tainted, morale risk) | §4.5 |
| 9 | Portable classroom / modular clinic | 960 sq ft | buy $60–100K; lease $1.2K/mo + $15K setup | §4.5 |
| 10 | Labour | FTE-year | deputy $43.6K; RN $61.6K; EMT $31.6K; min wage $7.25/h (add ~30% benefits [ASSUMPTION]) | §4.3 |
| (opt) | Motel room | night | $55 | §4.4 [UNVERIFIED] |

### 7.7 Hooks from real 2009 events worth scripting
H1N1 vaccine arriving late and short (Oct–Nov 2009); N95 allocation; Bashas' Winslow closing Oct 10 2009; Bloomfield refinery idled late Nov 2009 (regional fuel tightness); Jan 18–22 2010 winter storm → state + federal declarations incl. Navajo/Hopi; state legislature special sessions sweeping county money; 15.7% unemployment.

---

## 8. Gaps / not established
Total FY2009-10 all-funds adopted budget; ACS 2005-09 median rent and home value; 2009 county credit rating; credit unions; propane share of heating on reservations; Walmart DC (none found); modular clinic prices; Wigwam 2009 rate; FEMA reimbursement lag; PHER dollars to Navajo County; 2009 hospital bed counts (current counts used); LDS storehouse 2009 presence; 2007 Ag Census cattle figure for Navajo (table ambiguous).
