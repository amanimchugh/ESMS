// @ts-nocheck
import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";
import { TRANSLATIONS, LangContext, useLang } from "./i18n/translations.js";

// ═══════════════ TOKENS ═══════════════
const C = {
  navy:"#1A3A5C", navyDark:"#0D2038", navyLight:"#2A5F9E",
  teal:"#0E7C7B", tealLight:"#15A09F",
  amber:"#E8A020", green:"#2D8A4E",
  red:"#C0392B", purple:"#6C3483", orange:"#E8730A",
  bg:"#F0F4F8", card:"#FFFFFF",
  border:"#D0DCE8", text:"#1A2B3C", muted:"#5F7080",
};
const F = {
  d:"'Palatino Linotype','Book Antiqua',Palatino,'Noto Serif','Georgia',serif",
  b:"'Trebuchet MS','Noto Sans','Roboto',Tahoma,Geneva,sans-serif",
};

function useLS(k,d){
  const[v,sv]=useState(()=>{try{const s=localStorage.getItem(k);return s?JSON.parse(s):d;}catch{return d;}});
  useEffect(()=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},[k,v]);
  return[v,sv];
}

function useIsMobile(breakpoint=768){
  const[mobile,setMobile]=useState(()=>typeof window!=="undefined"&&window.innerWidth<=breakpoint);
  useEffect(()=>{
    const mq=window.matchMedia(`(max-width:${breakpoint}px)`);
    const handler=e=>setMobile(e.matches);
    mq.addEventListener("change",handler);
    setMobile(mq.matches);
    return()=>mq.removeEventListener("change",handler);
  },[breakpoint]);
  return mobile;
}

// ═══════════════ BASE STYLES ═══════════════
const S={
  inp:{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:7,fontSize:13,fontFamily:F.b,color:C.text,background:"white",boxSizing:"border-box",outline:"none"},
  ta:{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:7,fontSize:13,fontFamily:F.b,color:C.text,background:"white",boxSizing:"border-box",resize:"vertical",outline:"none",lineHeight:1.6},
  th:{background:C.navy,color:"white",padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"},
  td:{padding:"8px 11px",borderBottom:`1px solid ${C.border}`,verticalAlign:"middle",fontSize:13},
  lbl:{display:"block",fontWeight:700,fontSize:13,color:C.text,marginBottom:5},
  card:{background:"white",border:`1.5px solid ${C.border}`,borderRadius:11,padding:18},
  btn:{background:C.navy,color:"white",border:"none",borderRadius:7,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:F.b},
  outBtn:{background:"white",border:`1.5px solid ${C.border}`,borderRadius:7,padding:"8px 15px",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:F.b,color:C.navy},
};

// ═══════════════ MICRO COMPONENTS ═══════════════
const Lbl=({c,req})=><label style={S.lbl}>{c}{req&&<span style={{color:C.red,marginLeft:3}}>*</span>}</label>;
const Hint=({c})=><p style={{margin:"0 0 8px",fontSize:12,color:C.muted,lineHeight:1.5,fontStyle:"italic"}}>{c}</p>;
const InfoBox=({col=C.navyLight,bg="#EBF5FB",children})=><div style={{background:bg,border:`1.5px solid ${col}`,borderRadius:9,padding:"12px 16px",marginBottom:18,fontSize:13,lineHeight:1.65,color:C.text}}>{children}</div>;
const Tag=({label,col=C.teal,bg="#E8F8F5"})=><span style={{background:bg,color:col,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700,display:"inline-block"}}>{label}</span>;

// ═══════════════ CUSTOM CHECKLIST BUILDER ═══════════════
// Baseline items pre-populated from ROGEAP; user can check/uncheck & add own items
function ChecklistBuilder({baseline,value,onChange,columns=1}){
  const {t}=useLang();
  const sel=Array.isArray(value?.sel)?value.sel:[...baseline.map(b=>b.id)];
  const custom=Array.isArray(value?.custom)?value.custom:[];
  const[ni,sni]=useState("");const[editing,setEditing]=useState(null);
  const isChecked=id=>sel.includes(id);
  const toggle=id=>onChange({sel:isChecked(id)?sel.filter(s=>s!==id):[...sel,id],custom});
  const toggleCust=i=>onChange({sel,custom:custom.map((c,j)=>j===i?{...c,checked:!c.checked}:c)});
  const addCust=()=>{if(ni.trim()){onChange({sel,custom:[...custom,{id:`c_${Date.now()}`,text:ni.trim(),checked:true}]});sni("");}};
  const removeCust=i=>onChange({sel,custom:custom.filter((_,j)=>j!==i)});
  const editCust=(i,txt)=>onChange({sel,custom:custom.map((c,j)=>j===i?{...c,text:txt}:c)});

  const colStyle={display:"grid",gridTemplateColumns:columns===2?"1fr 1fr":"1fr",gap:"2px 16px"};
  return(<div>
    <div style={colStyle}>
      {baseline.map(b=>(
        <label key={b.id} style={{display:"flex",alignItems:"flex-start",gap:0,padding:"5px 8px",cursor:"pointer",borderRadius:6,background:isChecked(b.id)?"#F0F7FF":"transparent",transition:"background 0.1s"}}>
          <input type="checkbox" checked={isChecked(b.id)} onChange={()=>toggle(b.id)} style={{marginRight:8,marginTop:2,accentColor:C.navy,flexShrink:0}}/>
          <span style={{fontSize:13,lineHeight:1.5,flex:1}}>{b.text}</span>
          {b.ref&&<span style={{fontSize:10,color:C.muted,marginLeft:6,flexShrink:0,marginTop:2}}>{b.ref}</span>}
        </label>
      ))}
    </div>
    {custom.length>0&&<div style={{marginTop:8,borderTop:`1px dashed ${C.border}`,paddingTop:8}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:600}}>{t("checklistCustomLabel")}</div>
      {custom.map((c,i)=>(
        <div key={c.id||i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",background:"#FFFBF0",borderRadius:6,marginBottom:4}}>
          <input type="checkbox" checked={!!c.checked} onChange={()=>toggleCust(i)} style={{accentColor:C.amber,flexShrink:0}}/>
          {editing===i
            ?<input value={c.text} onChange={e=>editCust(i,e.target.value)} onBlur={()=>setEditing(null)} autoFocus style={{...S.inp,flex:1,padding:"3px 8px",fontSize:12}}/>
            :<span style={{flex:1,fontSize:13,cursor:"pointer"}} onClick={()=>setEditing(i)}>{c.text}</span>}
          <button onClick={()=>removeCust(i)} aria-label="Remove item" className="remove-btn" style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1,flexShrink:0}}>×</button>
        </div>
      ))}
    </div>}
    <div style={{display:"flex",gap:8,marginTop:10}}>
      <input value={ni} onChange={e=>sni(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCust()} placeholder={t("checklistPlaceholder")} style={{...S.inp,flex:1,fontSize:12,background:"#FAFBFC",borderStyle:"dashed"}}/>
      <button onClick={addCust} style={{...S.btn,padding:"8px 14px",fontSize:12,background:C.teal}}>{t("checklistAdd")}</button>
    </div>
    <div style={{fontSize:11,color:C.muted,marginTop:4}}>{(sel.length+custom.filter(c=>c.checked).length)} {t("checklistCount")}</div>
  </div>);
}

// ═══════════════ LIVE TABLE BUILDER ═══════════════
// Users can edit cell content, add rows, remove rows
function TableBuilder({columns,baselineRows,value,onChange,addRowLabel="Add Row"}){
  const rows=Array.isArray(value)?value:(Array.isArray(baselineRows)?baselineRows:[]);
  const updateCell=(ri,ci,v)=>{const r=[...rows];r[ri]={...r[ri],[ci]:v};onChange(r);};
  const addRow=()=>{const blank={};columns.forEach(c=>{blank[c.id]="";});onChange([...rows,blank]);};
  const removeRow=i=>onChange(rows.filter((_,j)=>j!==i));
  return(<div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
      <thead><tr>{columns.map(c=><th key={c.id} style={{...S.th,width:c.w||"auto"}}>{c.label}</th>)}<th style={{...S.th,width:40}}></th></tr></thead>
      <tbody>
        {rows.map((row,ri)=>(
          <tr key={ri} style={{background:ri%2===0?"white":"#FAFBFC"}}>
            {columns.map(c=>(
              <td key={c.id} style={S.td}>
                {c.type==="sel"
                  ?<select value={row[c.id]||""} onChange={e=>updateCell(ri,c.id,e.target.value)} style={{...S.inp,padding:"5px 8px"}}>
                    <option value="">—</option>{c.opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                  :c.type==="ta"
                    ?<textarea value={row[c.id]||""} onChange={e=>updateCell(ri,c.id,e.target.value)} rows={2} style={{...S.ta,padding:"4px 8px",minWidth:c.minW||120}}/>
                    :<input value={row[c.id]||""} onChange={e=>updateCell(ri,c.id,e.target.value)} placeholder={c.ph||""} style={{...S.inp,padding:"5px 8px"}}/>}
              </td>
            ))}
            <td style={{...S.td,textAlign:"center",padding:0}}><button onClick={()=>removeRow(ri)} aria-label="Remove row" className="remove-btn" style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:18,lineHeight:1,width:44,height:44}}>×</button></td>
          </tr>
        ))}
      </tbody>
    </table>
    <button onClick={addRow} style={{...S.outBtn,marginTop:10,fontSize:12,color:C.teal,borderColor:C.teal,display:"flex",alignItems:"center",gap:6}}>➕ {addRowLabel}</button>
  </div>);
}

// ═══════════════ SCORED RISK MATRIX ═══════════════
function RiskMatrix({baselineRisks,value,onChange}){
  const {t}=useLang();
  const rows=Array.isArray(value)?value:(Array.isArray(baselineRisks)?baselineRisks:[]).map(r=>({...r,applies:"yes",prob:r.prob||"2",sev:r.sev||"2",mitigation:r.mitigation||"",responsible:"",status:"Planned"}));
  const update=(ri,k,v)=>{const r=[...rows];r[ri]={...r[ri],[k]:v};onChange(r);};
  const addRow=()=>onChange([...rows,{risk:"",category:"Other",applies:"yes",prob:"1",sev:"1",mitigation:"",responsible:"",status:"Planned"}]);
  const removeRow=i=>onChange(rows.filter((_,j)=>j!==i));
  const ratingColor=(p,s)=>{const score=parseInt(p)*parseInt(s);if(score>=9)return{bg:"#FDECEA",c:C.red,label:t("riskCritical")};if(score>=6)return{bg:"#FFF3E0",c:"#E65100",label:t("riskHigh")};if(score>=3)return{bg:"#FFFDE7",c:"#F9A825",label:t("riskMedium")};return{bg:"#E8F5E9",c:C.green,label:t("riskLow")};};
  const colHeaders=[t("riskColHazard"),t("riskColCategory"),t("riskColApplies"),t("riskColProb"),t("riskColSev"),t("riskColRating"),t("riskColMitigation"),t("riskColResponsible"),t("riskColStatus")];
  return(<div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:900}}>
      <thead><tr>
        {colHeaders.map((h,i)=>
          <th key={i} style={{...S.th,width:["22%","9%","7%","8%","8%","7%","22%","9%","8%"][i]}}>{h}</th>)}
        <th style={{...S.th,width:30}}></th>
      </tr></thead>
      <tbody>
        {rows.map((row,ri)=>{
          const rc=row.applies==="yes"?ratingColor(row.prob||"1",row.sev||"1"):{bg:"white",c:C.muted,label:t("riskNA")};
          return(<tr key={ri} style={{background:row.applies==="no"?"#FAFAFA":"white"}}>
            <td style={S.td}><textarea value={row.risk||""} onChange={e=>update(ri,"risk",e.target.value)} rows={2} style={{...S.ta,padding:"4px 6px",fontSize:12}}/></td>
            <td style={S.td}><select value={row.category||""} onChange={e=>update(ri,"category",e.target.value)} style={{...S.inp,padding:"4px 6px",fontSize:11}}>
              <option value="">—</option>
              {[
                {v:"OHS",lk:"catOHS"},{v:"E-Waste",lk:"catEWaste"},{v:"Labour",lk:"catLabour"},
                {v:"Consumer",lk:"catConsumer"},{v:"Community",lk:"catCommunity"},
                {v:"Gender/SEAH",lk:"catGenderSEAH"},{v:"Supply Chain",lk:"catSupplyChain"},
                {v:"Security",lk:"catSecurity"},{v:"Environment",lk:"catEnvironment"},{v:"Other",lk:"catOther"}
              ].map(({v,lk})=><option key={v} value={v}>{t(lk)}</option>)}
            </select></td>
            <td style={{...S.td,textAlign:"center"}}><select value={row.applies||"yes"} onChange={e=>update(ri,"applies",e.target.value)} style={{...S.inp,padding:"4px 5px",fontSize:11,width:60}}>
              <option value="yes">{t("riskAppliesYes")}</option><option value="no">{t("riskAppliesNo")}</option></select></td>
            <td style={{...S.td,textAlign:"center"}}><select value={row.prob||"2"} onChange={e=>update(ri,"prob",e.target.value)} style={{...S.inp,padding:"4px 5px",fontSize:11,width:55}}>
              {["1","2","3","4"].map(o=><option key={o}>{o}</option>)}</select></td>
            <td style={{...S.td,textAlign:"center"}}><select value={row.sev||"2"} onChange={e=>update(ri,"sev",e.target.value)} style={{...S.inp,padding:"4px 5px",fontSize:11,width:55}}>
              {["1","2","3","4"].map(o=><option key={o}>{o}</option>)}</select></td>
            <td style={{...S.td,textAlign:"center"}}><span style={{background:rc.bg,color:rc.c,borderRadius:5,padding:"3px 6px",fontWeight:700,fontSize:11}}>{rc.label}</span></td>
            <td style={S.td}><textarea value={row.mitigation||""} onChange={e=>update(ri,"mitigation",e.target.value)} rows={2} style={{...S.ta,padding:"4px 6px",fontSize:12}}/></td>
            <td style={S.td}><input value={row.responsible||""} onChange={e=>update(ri,"responsible",e.target.value)} style={{...S.inp,padding:"4px 6px",fontSize:11}}/></td>
            <td style={S.td}><select value={row.status||"Planned"} onChange={e=>update(ri,"status",e.target.value)} style={{...S.inp,padding:"4px 5px",fontSize:11}}>
              <option value="Planned">{t("riskPlanned")}</option>
              <option value="In Progress">{t("riskInProgress")}</option>
              <option value="Complete">{t("riskComplete")}</option>
              <option value="Overdue">{t("riskOverdue")}</option>
              <option value="N/A">{t("riskNA")}</option>
            </select></td>
            <td style={{...S.td,textAlign:"center",padding:0}}><button onClick={()=>removeRow(ri)} aria-label="Remove risk row" className="remove-btn" style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:18,width:44,height:44}}>×</button></td>
          </tr>);
        })}
      </tbody>
    </table>
    <button onClick={addRow} style={{...S.outBtn,marginTop:10,fontSize:12,color:C.teal,borderColor:C.teal}}>{t("riskAdd")}</button>
    <div style={{marginTop:14,display:"flex",gap:10,flexWrap:"wrap"}}>
      {[{lk:"riskCritical",range:"(9-16)",bg:"#FDECEA",c:C.red},{lk:"riskHigh",range:"(6-8)",bg:"#FFF3E0",c:"#E65100"},{lk:"riskMedium",range:"(3-5)",bg:"#FFFDE7",c:"#F9A825"},{lk:"riskLow",range:"(1-2)",bg:"#E8F5E9",c:C.green}].map(r=>(
        <div key={r.lk} style={{background:r.bg,color:r.c,borderRadius:7,padding:"4px 12px",fontSize:11,fontWeight:700}}>{t(r.lk)} {r.range}</div>
      ))}
      <div style={{fontSize:11,color:C.muted,alignSelf:"center"}}>{t("riskLegend")}</div>
    </div>
  </div>);
}

// ═══════════════ INCIDENT LOG ═══════════════
function IncidentLog({value,onChange}){
  const {t}=useLang();
  const rows=value||[];
  const cols=[
    {id:"date",label:t("csvColDate"),w:"8%",ph:"DD/MM/YY"},
    {id:"type",label:t("csvColType"),w:"9%",type:"sel",opts:["Injury","Near-Miss","Property Damage","Environmental","Security","SEAH","Other"]},
    {id:"description",label:t("csvColDescription"),w:"22%",type:"ta"},
    {id:"location",label:t("csvColLocation"),w:"10%",ph:"Site/area"},
    {id:"persons",label:t("csvColPersons"),w:"10%",ph:"Role only"},
    {id:"cause",label:t("csvColCause"),w:"15%",type:"ta"},
    {id:"action",label:t("csvColAction"),w:"15%",type:"ta"},
    {id:"responsible",label:t("colResponsible"),w:"8%",ph:"Name"},
    {id:"status",label:t("colStatus"),w:"8%",type:"sel",opts:["Open","In Progress","Closed","Reported to Authority"]},
  ];
  return(<div>
    <InfoBox col={C.red} bg="#FFF5F5">{t("incidentInfoBox")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={[]} value={rows} onChange={onChange} addRowLabel={t("incidentAddRow")}/>
  </div>);
}

// ═══════════════ WASTE REGISTER ═══════════════
function WasteRegister({value,onChange}){
  const {t}=useLang();
  const rows=value||[];
  const cols=[
    {id:"date",label:t("csvColDate"),w:"8%",ph:"DD/MM/YY"},
    {id:"waste_type",label:t("csvColWasteType"),w:"12%",type:"sel",opts:["Lead-acid battery","Lithium battery","Solar panel","Inverter/controller","Accessories","Packaging","Office waste","Workshop waste","Other"]},
    {id:"qty_units",label:t("csvColQtyUnits"),w:"7%",ph:"#"},
    {id:"qty_kg",label:t("csvColQtyKg"),w:"7%",ph:"kg"},
    {id:"source",label:t("csvColSource"),w:"10%",ph:"Agent/area"},
    {id:"r5",label:t("csv5R"),w:"9%",type:"sel",opts:["Reduce","Reuse","Repair","Refurbish","Recycle","Dispose"]},
    {id:"disposal_route",label:t("csvColDisposalRoute"),w:"13%",ph:"Recycler/landfill"},
    {id:"recycler",label:t("colWasteRecycler"),w:"12%",ph:"Name"},
    {id:"certificate",label:t("colCertNo"),w:"10%",ph:"Ref no."},
    {id:"responsible",label:t("colResponsible"),w:"8%",ph:"Name"},
  ];
  return(<div>
    <InfoBox col={C.green} bg="#F0FFF4">{t("wasteInfoBox")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={[]} value={rows} onChange={onChange} addRowLabel={t("wasteAddRow")}/>
  </div>);
}

// ═══════════════ GRIEVANCE LOG ═══════════════
function GrievanceLog({value,onChange}){
  const {t}=useLang();
  const rows=value||[];
  const cols=[
    {id:"case_id",label:t("csvColCaseNo"),w:"7%",ph:"GRM-001"},
    {id:"date_received",label:t("csvColDateReceived"),w:"7%",ph:"DD/MM/YY"},
    {id:"channel",label:t("csvColChannel"),w:"8%",type:"sel",opts:["Phone/WhatsApp","Email","In-person","Suggestion box","Online form","Via agent","Anonymous","Other"]},
    {id:"complainant",label:t("colComplainantKnown"),w:"10%",ph:"Name or 'Anon'"},
    {id:"category",label:t("riskColCategory"),w:"9%",type:"sel",opts:["Working conditions","Product quality","Consumer protection","Environmental","Community","Gender/SEAH","Payment dispute","Safety","Other"]},
    {id:"description",label:t("csvColDescription"),w:"18%",type:"ta"},
    {id:"level",label:t("csvColLevel"),w:"6%",type:"sel",opts:["Level 1","Level 2","Level 3"]},
    {id:"assigned_to",label:t("csvColAssignedTo"),w:"8%",ph:"Name"},
    {id:"action",label:t("colActionTaken"),w:"13%",type:"ta"},
    {id:"satisfied",label:t("csvColSatisfied"),w:"6%",type:"sel",opts:["Yes","No","Pending","N/A"]},
    {id:"date_closed",label:t("csvColDateClosed"),w:"7%",ph:"DD/MM/YY"},
  ];
  return(<div>
    <InfoBox col={C.purple} bg="#F9F0FF">
      <strong>{t("grievanceTimelinesLabel")}</strong> {t("grievanceTimelinesText")}<br/>
      <strong>{t("grievanceLevelsLabel")}</strong> {t("grievanceLevelsText")}
    </InfoBox>
    <TableBuilder columns={cols} baselineRows={[]} value={rows} onChange={onChange} addRowLabel={t("grievanceAddRow")}/>
  </div>);
}

// ═══════════════ TRAINING REGISTER ═══════════════
function TrainingRegister({value,onChange}){
  const {t}=useLang();
  const rows=value||[];
  const cols=[
    {id:"date",label:t("csvColDate"),w:"8%",ph:"DD/MM/YY"},
    {id:"module",label:t("csvColModule"),w:"18%",ph:"e.g. OHS Induction"},
    {id:"facilitator",label:t("csvColFacilitator"),w:"10%",ph:"Name / Org"},
    {id:"participants",label:t("colParticipantsNo"),w:"8%",ph:"#"},
    {id:"target_group",label:t("csvColTargetGroup"),w:"11%",ph:"e.g. Field techs"},
    {id:"duration",label:t("csvColDuration"),w:"7%",ph:"hrs/days"},
    {id:"method",label:t("csvColMethod"),w:"9%",type:"sel",opts:["In-person","Workshop","On-the-job","Online","Toolbox talk","Certified course","Other"]},
    {id:"assessment",label:t("csvColAssessment"),w:"7%",type:"sel",opts:["Yes","No","Planned"]},
    {id:"cert_no",label:t("colCertNo"),w:"9%",ph:"Ref (if any)"},
    {id:"notes",label:t("colNotesGaps"),w:"12%",type:"ta"},
  ];
  return(<div>
    <InfoBox col={C.navyLight} bg="#EBF5FB">{t("trainingInfoBox")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={[]} value={rows} onChange={onChange} addRowLabel={t("trainingAddRow")}/>
  </div>);
}

// ═══════════════ STAKEHOLDER REGISTER ═══════════════
function StakeholderRegister({value,onChange}){
  const {t}=useLang();
  const baseline=[
    {group:"Customers (households / businesses)",interests:"Product reliability, affordability, safety, e-waste disposal",influence:"High",impact:"High",relationship:"Direct",method:"",frequency:"",responsible:""},
    {group:"Employees (all categories)",interests:"Fair wages, safe conditions, job security, career development",influence:"High",impact:"High",relationship:"Direct",method:"",frequency:"",responsible:""},
    {group:"Local communities (installation areas)",interests:"Safety, employment, environmental impacts, e-waste",influence:"Medium",impact:"High",relationship:"Indirect",method:"",frequency:"",responsible:""},
    {group:"Regulators (NERC / NESREA / Labour Dept.)",interests:"Compliance, licensing, product standards, labour law",influence:"High",impact:"Low",relationship:"Compliance",method:"",frequency:"",responsible:""},
    {group:"Investors / DFIs / ROGEAP",interests:"Financial returns, ESMS compliance, ESG performance",influence:"High",impact:"Medium",relationship:"Accountability",method:"",frequency:"",responsible:""},
    {group:"Product suppliers / manufacturers",interests:"Commercial terms, EPR requirements, quality standards",influence:"Medium",impact:"High",relationship:"Supply chain",method:"",frequency:"",responsible:""},
    {group:"Sales agents / distributors",interests:"Commission, training, support, consumer protection",influence:"Medium",impact:"High",relationship:"Commercial",method:"",frequency:"",responsible:""},
    {group:"E-waste recyclers / service providers",interests:"Business volume, compliance, safe handling",influence:"Low",impact:"High",relationship:"Partnership",method:"",frequency:"",responsible:""},
    {group:"NGOs / development partners",interests:"Community impact, gender equity, environmental outcomes",influence:"Low",impact:"Low",relationship:"Stakeholder",method:"",frequency:"",responsible:""},
    {group:"Industry bodies (GOGLA / NAFSMA)",interests:"Sector standards, advocacy, code compliance",influence:"Low",impact:"Low",relationship:"Peer",method:"",frequency:"",responsible:""},
  ];
  const rows=Array.isArray(value)&&value.length>0?value:baseline;
  const cols=[
    {id:"group",label:t("csvColGroup"),w:"16%",ph:"Group name"},
    {id:"interests",label:t("csvColInterests"),w:"18%",type:"ta"},
    {id:"influence",label:t("csvColInfluence"),w:"7%",type:"sel",opts:["High","Medium","Low"]},
    {id:"impact",label:t("colImpactThem"),w:"7%",type:"sel",opts:["High","Medium","Low"]},
    {id:"relationship",label:t("csvColRelationship"),w:"9%",ph:"Type"},
    {id:"method",label:t("colEngagementMethod"),w:"14%",type:"ta"},
    {id:"frequency",label:t("csvColFrequency"),w:"8%",type:"sel",opts:["Ongoing","Monthly","Quarterly","Annually","As needed"]},
    {id:"responsible",label:t("colResponsible"),w:"9%",ph:"Name"},
    {id:"last_engaged",label:t("colLastInspected"),w:"8%",ph:"DD/MM/YY"},
  ];
  return(<div>
    <InfoBox col={C.purple} bg="#F9F0FF">{t("stakeholderInfoBox2")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={baseline} value={rows} onChange={onChange} addRowLabel={t("stakeholderAddRow")}/>
  </div>);
}

// ═══════════════ PPE MATRIX ═══════════════
function PPEMatrix({value,onChange}){
  const {t}=useLang();
  const baseline=[
    {task:"Rooftop / elevated installation work",hazard:"Falls from height",ppe_required:"Fall arrest harness (EN355), hard hat (Class E), non-slip safety boots, hi-vis vest, UV-protection gloves",standard:"EN355, EN397",provided:"",inspected:"",notes:""},
    {task:"Electrical system work (live DC/AC)",hazard:"Electric shock, arc flash",ppe_required:"Insulated gloves (EN60903 Class 1 minimum), safety goggles, insulated footwear, no jewellery",standard:"EN60903 Class 1",provided:"",inspected:"",notes:""},
    {task:"Lead-acid battery handling",hazard:"Acid burns, toxic gas, fire",ppe_required:"Acid-resistant gloves, safety goggles, chemical-resistant apron, safety boots",standard:"EN374",provided:"",inspected:"",notes:""},
    {task:"Lithium battery handling / storage",hazard:"Thermal runaway, fire, toxic fumes",ppe_required:"Insulated gloves, safety goggles, fire-resistant apron",standard:"—",provided:"",inspected:"",notes:""},
    {task:"Warehouse / loading / unloading",hazard:"Manual handling, falling objects",ppe_required:"Safety boots (steel-toed), hi-vis vest, back support if heavy lifting",standard:"EN20345",provided:"",inspected:"",notes:""},
    {task:"Driving / field transportation",hazard:"Road accident, fatigue",ppe_required:"Seatbelt at all times; no mobile phone while driving",standard:"Road traffic law",provided:"",inspected:"",notes:""},
    {task:"Remote / outdoor work",hazard:"Heat, sun exposure, wildlife",ppe_required:"Sun-protective clothing, hat, sunscreen, water supply, insect repellent where applicable",standard:"—",provided:"",inspected:"",notes:""},
    {task:"Office / general work",hazard:"DSE, ergonomic",ppe_required:"No special PPE; ergonomic workstation",standard:"—",provided:"",inspected:"",notes:""},
  ];
  const rows=Array.isArray(value)&&value.length>0?value:baseline;
  const cols=[
    {id:"task",label:t("ppeColTask"),w:"15%",ph:"Describe task"},
    {id:"hazard",label:t("ppeColHazard"),w:"13%",ph:"Main hazard"},
    {id:"ppe_required",label:t("ppeColRequired"),w:"22%",type:"ta"},
    {id:"standard",label:t("ppeColStandard"),w:"8%",ph:"EN/ISO ref"},
    {id:"provided",label:t("ppeColProvided"),w:"8%",type:"sel",opts:["Yes","No","Partial","Planned"]},
    {id:"inspected",label:t("colLastInspected"),w:"7%",ph:"DD/MM/YY"},
    {id:"your_spec",label:t("ppeColSpec"),w:"18%",type:"ta"},
  ];
  return(<div>
    <InfoBox col={C.red} bg="#FFF5F5">{t("ppeInfoBox")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={baseline} value={rows} onChange={onChange} addRowLabel={t("ppeAddRow")}/>
  </div>);
}

// ═══════════════ COMPLIANCE TRACKER ═══════════════
function ComplianceTracker({value,onChange}){
  const {t}=useLang();
  const baseline=[
    {law:"[Country] Labour Act",authority:"Ministry of Labour",requirement:"Minimum wage, working hours, contracts, leave, non-discrimination",applies:"yes",status:"",expiry:"",responsible:"",evidence:""},
    {law:"[Country] Factories / OHS Act",authority:"Ministry of Labour / Factory Inspectorate",requirement:"Workplace safety, PPE, incident reporting, inspections",applies:"yes",status:"",expiry:"",responsible:"",evidence:""},
    {law:"[Country] Environmental Act / NESREA Regulations",authority:"NESREA / National EPA",requirement:"Waste management, e-waste, pollution prevention",applies:"yes",status:"",expiry:"",responsible:"",evidence:""},
    {law:"Consumer Protection Law",authority:"Consumer Protection Council",requirement:"Product safety, fair pricing, warranty, data privacy",applies:"yes",status:"",expiry:"",responsible:"",evidence:""},
    {law:"[Country] Companies Act",authority:"Corporate Affairs Commission",requirement:"Company registration, annual filings",applies:"yes",status:"",expiry:"",responsible:"",evidence:""},
    {law:"NERC Licensing Requirements",authority:"NERC / Rural Electrification Agency",requirement:"Operating licences for power activities above threshold",applies:"",status:"",expiry:"",responsible:"",evidence:""},
    {law:"VeraSol / IEC Product Standards",authority:"IEC / GOGLA",requirement:"Product quality and safety standards (IEC 62509, etc.)",applies:"yes",status:"",expiry:"",responsible:"",evidence:""},
    {law:"Basel Convention (E-Waste)",authority:"National Environment Authority",requirement:"Cross-border e-waste management compliance",applies:"",status:"",expiry:"",responsible:"",evidence:""},
    {law:"Gender-Based Violence / Domestic Violence Laws",authority:"Ministry of Justice / Police",requirement:"Reporting obligations for GBV incidents",applies:"yes",status:"",expiry:"",responsible:"",evidence:""},
    {law:"Income Tax / PAYE / VAT Obligations",authority:"Federal/State Revenue Authority",requirement:"Tax compliance — registration, filing, remittance",applies:"yes",status:"",expiry:"",responsible:"",evidence:""},
  ];
  const rows=Array.isArray(value)&&value.length>0?value:baseline;
  const cols=[
    {id:"law",label:t("complianceColLaw"),w:"16%",ph:"Name"},
    {id:"authority",label:t("complianceColAuthority"),w:"12%",ph:"Body"},
    {id:"requirement",label:t("complianceColReq"),w:"18%",type:"ta"},
    {id:"applies",label:t("complianceColApplies"),w:"6%",type:"sel",opts:["yes","no","unsure"]},
    {id:"status",label:t("complianceColStatus"),w:"9%",type:"sel",opts:["Compliant","Partial","Non-compliant","Under review","N/A"]},
    {id:"expiry",label:t("complianceColExpiry"),w:"7%",ph:"DD/MM/YY"},
    {id:"responsible",label:t("complianceColResponsible"),w:"8%",ph:"Name"},
    {id:"evidence",label:t("complianceColEvidence"),w:"14%",ph:"File name/location"},
    {id:"action",label:t("complianceColAction"),w:"12%",type:"ta"},
  ];
  return(<div>
    <InfoBox col={C.amber} bg="#FFF8ED">{t("complianceInfoBox")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={baseline} value={rows} onChange={onChange} addRowLabel={t("complianceAdd")}/>
  </div>);
}

// ═══════════════ SCREENING QUESTIONNAIRE ═══════════════
// Directly from ROGEAP Table 6
function ScreeningQuestionnaire({value,onChange}){
  const {t}=useLang();
  const sections=[
    {id:"excl",title:t("screeningC1"),subtitle:t("screeningC1sub"),items:[
      {id:"forced_labour",text:"Has the company been involved in production or activities involving forced labour?",critical:true},
      {id:"child_labour",text:"Has the company been involved in production or activities involving child labour?",critical:true},
      {id:"ewaste_noncompliant",text:"Has the company been involved in cross-border trade in waste not compliant with the Basel Convention?",critical:true},
      {id:"ohs_incidents",text:"Has the company had confirmed cases of OHS incidents or accidents? (Note: If properly documented and addressed, may still be eligible)",critical:true},
      {id:"gbv_cases",text:"Has the company had confirmed cases of Gender Based Violence / Sexual Exploitation and Abuse?",critical:true},
      {id:"discrimination",text:"Has the company had confirmed cases of discrimination of vulnerable groups (gender, disability)?",critical:true},
    ]},
    {id:"esms",title:t("screeningC2"),subtitle:t("screeningC2sub"),items:[
      {id:"has_es_policy",text:"Does the company have an Environmental and / or Social Policy?"},
      {id:"es_training",text:"Does the company conduct E&S, gender awareness, and SEA/SH training internally?"},
      {id:"hr_policy",text:"Does the company have a Human Resources Policy?"},
      {id:"hr_labour_laws",text:"Does the HR Policy comply with country labour laws and regulations?"},
      {id:"hr_nondiscrim",text:"Does the HR Policy provide for non-discrimination and equal opportunity for women and vulnerable groups?"},
      {id:"hr_no_child",text:"Does the HR Policy prohibit child labour?"},
      {id:"hr_no_forced",text:"Does the HR Policy prohibit forced labour?"},
      {id:"worker_grievance",text:"Is there a workers' grievance mechanism in place?"},
    ]},
    {id:"ohs",title:t("screeningC3"),items:[
      {id:"ohs_policy",text:"Does the company have a policy or guidelines on occupational health and safety?"},
      {id:"ohs_officer",text:"Does the company have designated internal OHS coordinators / staff?"},
      {id:"ppe_provided",text:"Does the company provide Personal Protective Equipment (PPE) to its workers?"},
      {id:"ohs_training",text:"Does the company conduct regular OHS training for its workers and employees?"},
      {id:"incident_system",text:"Does the company have a clear, documented workplace incident and accident tracking system?"},
      {id:"code_of_conduct",text:"Does the company have a Code of Conduct for workers?"},
      {id:"gbv_training",text:"Does the company provide internal training on Gender Based Violence?"},
      {id:"ohs_monitoring",text:"Does the company have a monitoring system for workplace conditions and safety?"},
    ]},
    {id:"ewaste",title:t("screeningC4"),items:[
      {id:"battery_collection",text:"Does the company have a policy or process for collecting used batteries from customers?"},
      {id:"battery_recycling",text:"Does the company have a process for recycling/disposal of used lead-acid and lithium-ion batteries?"},
      {id:"buyback",text:"Does the company have buy-back agreements with equipment manufacturers?"},
      {id:"systematic_collection",text:"Does the company systematically collect used batteries and/or units from consumers?"},
      {id:"ewaste_education",text:"Does the company inform end users about the e-waste issue and proper e-waste management?"},
    ]},
    {id:"stakeholders",title:t("screeningC5"),items:[
      {id:"sep_exists",text:"Does the company have a Stakeholder Engagement Plan (SEP)?"},
      {id:"public_education",text:"Does the company engage in consumer and public education about E&S aspects of solar energy?"},
      {id:"stakeholders_identified",text:"Has the company identified key external stakeholders for its business?"},
      {id:"stakeholder_events",text:"Does the company hold events or similar actions to engage with stakeholders?"},
      {id:"grievance_written",text:"Is there a written mechanism to receive and address complaints?"},
    ]},
  ];

  const d=value||{};
  const setVal=(id,k,v)=>onChange({...d,[id]:{...(d[id]||{}),[k]:v}});

  const yesNoStyle=(ans)=>{
    if(ans==="yes")return{background:"#E8F5E9",color:C.green,border:`1px solid ${C.green}`};
    if(ans==="no")return{background:"#FDECEA",color:C.red,border:`1px solid ${C.red}`};
    return{background:"#F5F5F5",color:C.muted,border:`1px solid ${C.border}`};
  };

  const ANS_LABELS={yes:t("screeningYes"),no:t("screeningNo"),partial:t("screeningPartial"),"n/a":t("screeningNA")};
  return(<div>
    <InfoBox col={C.navy} bg="#EBF5FB">{t("screeningInfoBox")}</InfoBox>
    {sections.map(sec=>(
      <div key={sec.id} style={{...S.card,marginBottom:16}}>
        <div style={{fontWeight:700,color:C.navy,fontSize:15,marginBottom:4,fontFamily:F.d}}>{sec.title}</div>
        {sec.subtitle&&<div style={{fontSize:12,color:C.muted,marginBottom:12,fontStyle:"italic"}}>{sec.subtitle}</div>}
        {sec.items.map(item=>(
          <div key={item.id} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 12px",borderRadius:8,marginBottom:6,background:item.critical?"#FFF5F5":"#FAFBFC",border:`1px solid ${item.critical?"#FCCECE":C.border}`}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,lineHeight:1.5}}>{item.critical&&<span style={{fontSize:10,color:C.red,fontWeight:700,marginRight:6}}>{t("screeningExclusion")}</span>}{item.text}</div>
              {d[item.id]?.notes&&<div style={{fontSize:12,color:C.muted,marginTop:4,fontStyle:"italic"}}>📝 {d[item.id].notes}</div>}
            </div>
            <div style={{display:"flex",gap:5,flexShrink:0}}>
              {["yes","no","partial","n/a"].map(ans=>(
                <button key={ans} onClick={()=>setVal(item.id,"answer",ans)} style={{...yesNoStyle(d[item.id]?.answer===ans?ans:""),borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:F.b,background:d[item.id]?.answer===ans?yesNoStyle(ans).background:"white"}}>
                  {ANS_LABELS[ans]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>);
}

// ═══════════════ MONITORING FORM (ROGEAP Table 22) ═══════════════
function MonitoringForm({value,onChange}){
  const d=value||{};
  const set=(k,v)=>onChange({...d,[k]:v});
  const YN=({id,label})=>(
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"#FAFBFC",borderRadius:8,marginBottom:6,border:`1px solid ${C.border}`}}>
      <div style={{flex:1,fontSize:13}}>{label}</div>
      <div style={{display:"flex",gap:5}}>
        {["Yes","No"].map(o=><button key={o} onClick={()=>set(`${id}_yn`,o)} style={{background:d[`${id}_yn`]===o?(o==="Yes"?"#E8F5E9":"#FDECEA"):"white",color:d[`${id}_yn`]===o?(o==="Yes"?C.green:C.red):C.muted,border:`1px solid ${d[`${id}_yn`]===o?(o==="Yes"?C.green:C.red):C.border}`,borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:F.b}}>{o}</button>)}
      </div>
      {d[`${id}_yn`]==="Yes"&&<textarea value={d[`${id}_details`]||""} onChange={e=>set(`${id}_details`,e.target.value)} placeholder="Provide details / attach document reference…" rows={2} style={{...S.ta,width:260,fontSize:12}}/>}
    </div>
  );
  return(<div>
    <InfoBox col={C.navy} bg="#EBF5FB">
      This form is based on the ROGEAP Operational Manual E&S Risk Monitoring Form (Table 22). Complete it at least quarterly for ROGEAP reporting and internal management review.
    </InfoBox>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:12,fontFamily:F.d}}>Report Header</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[["company","Company Name"],["completed_by","Completed By (Name)"],["position","Position"],["period_from","Reporting Period — From"],["period_to","Reporting Period — To"],["date","Date Completed"]].map(([k,l])=>(
          <div key={k}><Lbl c={l}/><input value={d[k]||""} onChange={e=>set(k,e.target.value)} style={S.inp}/></div>
        ))}
      </div>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:12,fontFamily:F.d}}>ESMS General</div>
      <YN id="esms_developed" label="Has the company developed and implemented an ESMS?"/>
      <YN id="esms_updated" label="Has the ESMS or any policy/procedure been updated during the reporting period?"/>
      <YN id="roles_defined" label="Are roles and responsibilities of ESMS staff well-defined and understood?"/>
      <div style={{marginTop:8}}>
        <Lbl c="Name and contact of main ESMS responsible person"/>
        <input value={d.esms_focal||""} onChange={e=>set("esms_focal",e.target.value)} placeholder="Name, role, phone/email" style={S.inp}/>
      </div>
      <div style={{marginTop:8}}>
        <Lbl c="Other ESMS staff involved (name and role)"/>
        <textarea value={d.esms_staff||""} onChange={e=>set("esms_staff",e.target.value)} rows={2} style={S.ta}/>
      </div>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:12,fontFamily:F.d}}>Policies & Processes</div>
      <YN id="es_policy_updated" label="Has the E&S Policy been recently reviewed/updated and signed off?"/>
      <YN id="hr_policy_updated" label="Has the HR Policy been recently reviewed/updated?"/>
      <YN id="ohs_updated" label="Have OHS procedures been recently updated?"/>
      <YN id="sep_updated" label="Has the Stakeholder Engagement Plan been recently updated?"/>
      <YN id="gm_updated" label="Has the Grievance Mechanism (including SEA/SH process) been recently updated?"/>
      <YN id="esap_progress" label="Is the Environmental and Social Action Plan (ESAP) being carried out as planned?"/>
      <div style={{marginTop:8}}>
        <Lbl c="Difficulties or constraints with ESAP implementation (if any)"/>
        <textarea value={d.esap_constraints||""} onChange={e=>set("esap_constraints",e.target.value)} rows={3} style={S.ta}/>
      </div>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:12,fontFamily:F.d}}>Capacity & Training</div>
      <YN id="training_conducted" label="Was E&S, OHS, or gender/SEAH training provided to staff during the reporting period?"/>
      <div style={{marginTop:8}}>
        <Lbl c="Describe training delivered (module, audience, date, no. of participants)"/>
        <textarea value={d.training_detail||""} onChange={e=>set("training_detail",e.target.value)} rows={3} style={S.ta}/>
      </div>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:12,fontFamily:F.d}}>Monitoring & Incidents</div>
      <YN id="monitoring_plan" label="Do you have an internal monitoring and review plan?"/>
      <YN id="incidents" label="Were any workplace incidents, accidents, or near-misses recorded during this period?"/>
      <YN id="grievances" label="Were any grievances received through the Grievance Mechanism during this period?"/>
      <YN id="seah_complaints" label="Were any GBV/SEAH complaints received during this period? (Record Y/N only — no victim details)"/>
      <YN id="gm_external" label="Have you implemented an external communication and grievance mechanism accessible to the public?"/>
      <div style={{marginTop:8}}>
        <Lbl c="KPI Summary for this reporting period (key numbers)"/>
        <textarea value={d.kpi_summary||""} onChange={e=>set("kpi_summary",e.target.value)} placeholder="e.g. E-waste collected: 45 kg | Incidents: 1 near-miss | Complaints: 3 received, 3 resolved | Training sessions: 2" rows={3} style={S.ta}/>
      </div>
    </div>
    <div style={{...S.card}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:12,fontFamily:F.d}}>Reporting & Next Steps</div>
      <YN id="internal_reporting" label="Is there an internal process to report on E&S issues to management?"/>
      <div style={{marginTop:8}}>
        <Lbl c="Main actions planned for next reporting period"/>
        <textarea value={d.next_actions||""} onChange={e=>set("next_actions",e.target.value)} rows={3} style={S.ta}/>
      </div>
      <div style={{marginTop:8}}>
        <Lbl c="Signature and Date"/>
        <input value={d.signature||""} onChange={e=>set("signature",e.target.value)} placeholder="Name, role, date" style={S.inp}/>
      </div>
    </div>
  </div>);
}

// ═══════════════ SUPPLIER ASSESSMENT ═══════════════
function SupplierAssessment({value,onChange}){
  const {t}=useLang();
  const rows=value||[];
  const cols=[
    {id:"supplier",label:t("supplierColName"),w:"13%",ph:"Company name"},
    {id:"country",label:t("csvColCountry"),w:"7%",ph:"Country"},
    {id:"category",label:t("riskColCategory"),w:"10%",type:"sel",opts:["Panels / Modules","Batteries","Accessories","Logistics","Agent/Distributor","Service provider","Other"]},
    {id:"spend",label:t("csvColSpend"),w:"8%",ph:"USD amount"},
    {id:"es_policy",label:t("csvColESPolicy"),w:"7%",type:"sel",opts:["Yes","No","Partial","Unknown"]},
    {id:"child_labour",label:t("csvColChildLabour"),w:"8%",type:"sel",opts:["Low","Medium","High","Unknown"]},
    {id:"forced_labour",label:t("csvColForcedLabour"),w:"8%",type:"sel",opts:["Low","Medium","High","Unknown"]},
    {id:"ewaste",label:t("csvColEwaste"),w:"7%",type:"sel",opts:["Yes","No","Partial","Unknown"]},
    {id:"certified",label:t("csvColCertified"),w:"8%",ph:"e.g. RBA, ISO"},
    {id:"last_review",label:t("csvColLastReview"),w:"7%",ph:"DD/MM/YY"},
    {id:"action",label:t("complianceColAction"),w:"14%",type:"ta"},
  ];
  return(<div>
    <InfoBox col={C.orange} bg="#FFF3E0">{t("supplierInfoBox")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={[]} value={rows} onChange={onChange} addRowLabel={t("supplierAddBtn")}/>
  </div>);
}

// ═══════════════ ESAP TABLE ═══════════════
// ROGEAP-aligned ESAP with all required columns
function ESAPTable({value,onChange}){
  const {t}=useLang();
  const rows=value||[];
  const STATUS={
    "Not Started":{bg:"#F0F4F8",c:C.muted,lk:"notStarted"},
    "In Progress":{bg:"#FFF8ED",c:C.amber,lk:"inProgress"},
    "Completed":{bg:"#EAF7F1",c:C.green,lk:"completed"},
    "Overdue":{bg:"#FDECEA",c:C.red,lk:"overdue"},
    "Deferred":{bg:"#F3E5F5",c:"#6C3483",lk:"deferred"},
  };
  const categories=["ESMS / Policy","Labour & Working Conditions","OHS","E-Waste Management","Consumer/End User Health & Safety","Stakeholder Engagement & GRM","Gender / SEAH","HR Management","Compliance","Capacity & Training","Other"];
  const add=()=>onChange([...rows,{id:Date.now(),cat:"ESMS / Policy",objective:"",output:"",actions:"",kpi:"",baseline:"",target:"",deadline:"",responsible:"",budget:"",verifier:"",status:"Not Started"}]);
  const update=(i,k,v)=>{const r=[...rows];r[i]={...r[i],[k]:v};onChange(r);};
  const remove=i=>onChange(rows.filter((_,j)=>j!==i));
  return(<div>
    <InfoBox col={C.navy} bg="#EBF5FB">{t("esapInfoBox")}</InfoBox>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {Object.entries(STATUS).map(([s,st])=><span key={s} style={{background:st.bg,color:st.c,borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700}}>{rows.filter(r=>r.status===s).length} {t(st.lk)}</span>)}
      </div>
      <button onClick={add} style={S.btn}>{t("esapAdd")}</button>
    </div>
    {rows.length===0&&<div style={{textAlign:"center",padding:50,background:C.bg,borderRadius:12,border:`2px dashed ${C.border}`}}>
      <div style={{fontSize:36,marginBottom:8}}>📋</div>
      <div style={{fontWeight:700,color:C.text}}>{t("esapEmpty")}</div>
      <div style={{fontSize:13,color:C.muted,marginTop:4}}>{t("esapEmptyNote")}</div>
    </div>}
    {rows.map((row,i)=>{
      const st=STATUS[row.status]||STATUS["Not Started"];
      return(<div key={row.id||i} style={{...S.card,marginBottom:12,borderLeft:`4px solid ${st.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:8,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontWeight:700,color:C.navy,fontSize:14}}>{t("esapActionNo")}{i+1}</span>
            <select value={row.cat||""} onChange={e=>update(i,"cat",e.target.value)} style={{...S.inp,width:"auto",fontSize:12,padding:"4px 8px"}}>
              {categories.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <select value={row.status} onChange={e=>update(i,"status",e.target.value)} style={{...S.inp,width:"auto",fontSize:12,padding:"4px 8px",background:st.bg,color:st.c,fontWeight:700,borderColor:st.c}}>
              {Object.keys(STATUS).map(s=><option key={s} value={s}>{t(STATUS[s].lk)}</option>)}
            </select>
            <button onClick={()=>remove(i)} style={{...S.outBtn,color:C.red,borderColor:C.red,padding:"5px 11px",fontSize:12}}>{t("esapRemove")}</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          {[["objective",t("esapObjective")],["output",t("esapOutput")]].map(([k,l])=>(
            <div key={k}><Lbl c={l}/><textarea value={row[k]||""} onChange={e=>update(i,k,e.target.value)} rows={2} style={S.ta}/></div>
          ))}
        </div>
        <div style={{marginBottom:10}}><Lbl c={t("esapActions")}/><textarea value={row.actions||""} onChange={e=>update(i,"actions",e.target.value)} rows={2} style={S.ta}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
          {[["kpi",t("esapKpi")],["baseline",t("esapBaseline")],["target",t("esapTarget")]].map(([k,l])=>(
            <div key={k}><Lbl c={l}/><input value={row[k]||""} onChange={e=>update(i,k,e.target.value)} style={S.inp}/></div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
          {[["deadline",t("esapDeadline")],["responsible",t("esapResponsible")],["budget",t("esapBudget")],["verifier",t("esapVerifier")]].map(([k,l])=>(
            <div key={k}><Lbl c={l}/><input value={row[k]||""} onChange={e=>update(i,k,e.target.value)} placeholder={k==="budget"?"e.g. 500":""} style={S.inp}/></div>
          ))}
        </div>
      </div>);
    })}
  </div>);
}

// ═══════════════ CODE OF CONDUCT BUILDER ═══════════════
function CodeOfConductBuilder({value,onChange}){
  const d=value||{};
  const set=(k,v)=>onChange({...d,[k]:v});
  const BASELINE_ITEMS=[
    {id:"competence",text:"Carry out duties competently and diligently, maintaining professional standards at all times"},
    {id:"comply_laws",text:"Comply with this Code of Conduct and all applicable laws, regulations, and company requirements"},
    {id:"safe_workplace",text:"Maintain a safe working environment — ensure workplaces and equipment under your control are safe; wear required PPE; follow emergency operating procedures"},
    {id:"report_unsafe",text:"Report work situations you believe are unsafe or unhealthy; remove yourself from any situation presenting imminent and serious danger"},
    {id:"respect",text:"Treat all people with respect regardless of gender, race, ethnicity, nationality, language, religion, political opinion, social origin, disability, or any other characteristic"},
    {id:"no_discrimination",text:"Not discriminate against specific groups including women, people with disabilities, migrant workers, or children"},
    {id:"no_seah_harassment",text:"Not engage in Sexual Harassment — meaning unwelcome sexual advances, requests for sexual favours, or other verbal/physical conduct of a sexual nature"},
    {id:"no_exploitation",text:"Not engage in Sexual Exploitation — meaning any actual or attempted abuse of position of vulnerability or power for sexual purposes"},
    {id:"no_abuse",text:"Not engage in Sexual Abuse — meaning any actual or threatened physical intrusion of a sexual nature, whether by force or under coercive conditions"},
    {id:"no_sex_minors",text:"Not engage in any form of sexual activity with individuals under 18 years of age under any circumstances"},
    {id:"complete_training",text:"Complete all mandatory training provided by the company, including on E&S, health and safety, SEA/SH prevention, and Code of Conduct"},
    {id:"report_violations",text:"Report violations of this Code of Conduct — through the grievance mechanism or to management — without fear of retaliation"},
    {id:"no_retaliation_coc",text:"Not retaliate against any person who reports violations of this Code, uses the grievance mechanism, or cooperates in an investigation"},
    {id:"no_corruption",text:"Not engage in bribery, fraud, or any corrupt practice in connection with company business"},
    {id:"ewaste_responsibility",text:"Handle and dispose of e-waste (batteries, panels, accessories) in accordance with the company's Waste Management Plan"},
    {id:"confidentiality",text:"Maintain confidentiality of company information, customer data, and grievance complaints"},
  ];
  return(<div>
    <InfoBox col={C.navyLight} bg="#EBF5FB">This Code of Conduct is based on the ROGEAP sample (Box 2 of the Guidelines). All employees and subcontractors must read, sign, and receive a copy in a language they understand. Signed copies must be retained on file. Select the items applicable to your company and add any additional requirements.</InfoBox>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:4,fontFamily:F.d}}>Company Details</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[["company_name","Company Name"],["effective_date","Effective Date"],["approved_by","Approved By (Name & Title)"]].map(([k,l])=>(
          <div key={k}><Lbl c={l}/><input value={d[k]||""} onChange={e=>set(k,e.target.value)} style={S.inp}/></div>
        ))}
      </div>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:4,fontFamily:F.d}}>Preamble</div>
      <Hint c="This introductory paragraph sets the tone. Edit as needed."/>
      <textarea value={d.preamble||`This Code of Conduct is part of our measures to address environmental, social, health and safety (ESHS) risks related to our operations and the products and services we provide. The Code specifies behaviour expected of all our employees and subcontractors. Our workplace is an environment where unsafe, offensive, abusive, or violent behaviour will not be tolerated, and where all persons should feel comfortable raising issues or concerns without fear of retaliation.`} onChange={e=>set("preamble",e.target.value)} rows={5} style={S.ta}/>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:8,fontFamily:F.d}}>Code of Conduct Requirements</div>
      <Hint c="All pre-populated items are selected. Deselect any not applicable; add your own at the bottom."/>
      <ChecklistBuilder baseline={BASELINE_ITEMS} value={d.items} onChange={v=>set("items",v)}/>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:4,fontFamily:F.d}}>Consequences of Violation</div>
      <textarea value={d.consequences||`Any violation of this Code of Conduct may result in serious consequences, up to and including:\n• Verbal or written warning (for minor violations)\n• Suspension without pay (for serious violations)\n• Termination of employment or contract\n• Referral to relevant legal authorities (for criminal violations, including GBV/SEA/SH)\n\nThe severity of the consequence will depend on the nature and seriousness of the violation.`} onChange={e=>set("consequences",e.target.value)} rows={6} style={S.ta}/>
    </div>
    <div style={{...S.card}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:4,fontFamily:F.d}}>Reporting Violations</div>
      <textarea value={d.reporting||`If any person observes behaviour that may represent a violation of this Code, or that otherwise concerns them, they should raise the issue promptly through the company's grievance mechanism.\n\nChannel: [WhatsApp / Phone / Email / In-person — specify contact details]\n\nThe person's identity will be kept confidential unless reporting is mandated by law. Anonymous complaints may also be submitted and will be given appropriate consideration. There will be no retaliation against any person who raises a concern in good faith.`} onChange={e=>set("reporting",e.target.value)} rows={6} style={S.ta}/>
      <div style={{marginTop:12,background:"#F8FAFD",borderRadius:8,padding:12}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>Employee Acknowledgement (Signing Block)</div>
        <div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>I have received a copy of the Code of Conduct in a language I understand. I have read and understand the behaviour expected of me. I understand the consequences of non-compliance and commit to comply fully.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:8}}>
          {["Full Name:","Position:","Signature:","Date:"].map((l,i)=><div key={i} style={{fontSize:12,borderBottom:`1px solid ${C.border}`,paddingBottom:4,color:C.muted}}>{l} _______________________</div>)}
        </div>
      </div>
    </div>
  </div>);
}

// ═══════════════ TOOLS REGISTRY ═══════════════
const TOOLS_REGISTRY = {
  screening: { id:"screening", icon:"📋", lk:"toolLblScreening", dk:"toolDescScreening", color:C.navy, tag:"Assessment", component:"ScreeningQuestionnaire" },
  risk_matrix: { id:"risk_matrix", icon:"🔍", lk:"toolLblRisk", dk:"toolDescRisk", color:C.red, tag:"Risk Assessment", component:"RiskMatrix" },
  compliance: { id:"compliance", icon:"⚖️", lk:"toolLblCompliance", dk:"toolDescCompliance", color:C.amber, tag:"Compliance", component:"ComplianceTracker" },
  ppe_matrix: { id:"ppe_matrix", icon:"🦺", lk:"toolLblPpe", dk:"toolDescPpe", color:C.red, tag:"OHS", component:"PPEMatrix" },
  incident_log: { id:"incident_log", icon:"🚑", lk:"toolLblIncident", dk:"toolDescIncident", color:C.red, tag:"OHS", component:"IncidentLog" },
  training_register: { id:"training_register", icon:"🎓", lk:"toolLblTraining", dk:"toolDescTraining", color:C.navyLight, tag:"Capacity", component:"TrainingRegister" },
  coc: { id:"coc", icon:"📜", lk:"toolLblCoc", dk:"toolDescCoc", color:C.navyLight, tag:"HR Policy", component:"CodeOfConductBuilder" },
  waste_register: { id:"waste_register", icon:"♻️", lk:"toolLblWaste", dk:"toolDescWaste", color:C.green, tag:"Waste Management", component:"WasteRegister" },
  stakeholder_register: { id:"stakeholder_register", icon:"🤝", lk:"toolLblStakeholder", dk:"toolDescStakeholder", color:C.purple, tag:"SEP", component:"StakeholderRegister" },
  grievance_log: { id:"grievance_log", icon:"📬", lk:"toolLblGrievance", dk:"toolDescGrievance", color:C.purple, tag:"Grievance Mechanism", component:"GrievanceLog" },
  supplier_assessment: { id:"supplier_assessment", icon:"🔗", lk:"toolLblSupplier", dk:"toolDescSupplier", color:C.orange, tag:"Supply Chain", component:"SupplierAssessment" },
  monitoring_form: { id:"monitoring_form", icon:"📊", lk:"toolLblMonitoring", dk:"toolDescMonitoring", color:C.teal, tag:"Monitoring", component:"MonitoringForm" },
  esap: { id:"esap", icon:"📝", lk:"toolLblEsap", dk:"toolDescEsap", color:C.navy, tag:"ESAP", component:"ESAPTable" },
};

const TOOL_COMPONENTS = {
  ScreeningQuestionnaire, RiskMatrix, ComplianceTracker, PPEMatrix,
  IncidentLog, TrainingRegister, CodeOfConductBuilder, WasteRegister,
  StakeholderRegister, GrievanceLog, SupplierAssessment, MonitoringForm, ESAPTable,
};

const TOOL_GROUPS = [
  { lk:"grpAssessment", tags:["Assessment","Risk Assessment","Compliance"], color:C.navy },
  { lk:"grpOHS", tags:["OHS"], color:C.red },
  { lk:"grpHR", tags:["HR Policy","Capacity"], color:C.navyLight },
  { lk:"grpEnvironment", tags:["Waste Management"], color:C.green },
  { lk:"grpStakeholder", tags:["SEP","Grievance Mechanism"], color:C.purple },
  { lk:"grpSupplyChain", tags:["Supply Chain"], color:C.orange },
  { lk:"grpMonitoring", tags:["Monitoring","ESAP"], color:C.teal },
];

// ═══════════════ TOOLS SECTION ═══════════════
function ToolsSection({ esmsData, setFieldValue, openGuide }) {
  const {t}=useLang();
  const [activeTool, setActiveTool] = useState(null);

  const getVal = (id) => esmsData[`tool_${id}`];
  const setVal = (id, v) => setFieldValue(`tool_${id}`, "data", v);

  if (activeTool) {
    const tool = TOOLS_REGISTRY[activeTool];
    const Comp = TOOL_COMPONENTS[tool.component];
    const val = getVal(activeTool)?.data;
    return (
      <div>
        <button onClick={() => setActiveTool(null)} style={{ ...S.outBtn, marginBottom: 20, display:"flex", alignItems:"center", gap:6 }}>
          {t("toolsBack")}
        </button>
        <div style={{ ...S.card, marginBottom: 18, borderLeft: `5px solid ${tool.color}` }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-start", flexWrap:"wrap" }}>
            <div style={{ fontSize:30 }}>{tool.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4, flexWrap:"wrap" }}>
                <h3 style={{ margin:0, fontFamily:F.d, color:C.text, fontSize:19 }}>{t(tool.lk)}</h3>
                <Tag label={tool.tag} col={tool.color} bg={`${tool.color}18`}/>
              </div>
              <p style={{ margin:0, color:C.muted, fontSize:13, lineHeight:1.5 }}>{t(tool.dk)}</p>
            </div>
            {GUIDELINES_DB[`tool_${activeTool}`] && <GuideBtn guideId={`tool_${activeTool}`} onOpen={openGuide}/>}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
          <ExportBar
            title={t(tool.lk)} filename={`ESMS_${activeTool}`}
            sections={buildToolSection(activeTool, esmsData, t)}
            csvToolId={["risk_matrix","compliance","incident_log","waste_register","grievance_log","training_register","stakeholder_register","supplier_assessment","esap"].includes(activeTool) ? activeTool : null}
            esmsData={esmsData}
          />
        </div>
        <Comp value={val} onChange={v => setVal(activeTool, v)} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:18, paddingBottom:18, borderBottom:`2px solid ${C.border}` }}>
        <div style={{ fontSize:34 }}>🛠️</div>
        <div style={{ flex:1 }}>
          <h2 style={{ margin:0, color:C.text, fontSize:22, fontFamily:F.d }}>{t("toolsTitle")}</h2>
          <p style={{ margin:"8px 0 0", color:C.muted, fontSize:14, lineHeight:1.6 }}>{t("toolsDesc")}</p>
        </div>
        <GuideBtn guideId="tools" onOpen={openGuide}/>
      </div>

      <InfoBox col={C.amber} bg="#FFF8ED">{t("toolsInfoBox")}</InfoBox>

      {TOOL_GROUPS.map(grp => {
        const groupTools = Object.values(TOOLS_REGISTRY).filter(tool => grp.tags.includes(tool.tag));
        if (!groupTools.length) return null;
        return (
          <div key={grp.lk} style={{ marginBottom:24 }}>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:10, paddingBottom:6, borderBottom:`2px solid ${grp.color}30`, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:16, height:3, background:grp.color, borderRadius:2, display:"inline-block" }}/>
              {t(grp.lk)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(290px,1fr))", gap:12 }}>
              {groupTools.map(tool => {
                const hasData = !!(getVal(tool.id)?.data);
                const toolLabel = t(tool.lk);
                const toolDesc = t(tool.dk);
                return (
                  <div key={tool.id} onClick={() => setActiveTool(tool.id)}
                    style={{ ...S.card, cursor:"pointer", borderLeft:`4px solid ${tool.color}`, position:"relative", transition:"all 0.15s", borderColor: hasData ? C.green : C.border, borderWidth:"1.5px 1.5px 1.5px 4px" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}>
                    {hasData && <span style={{ position:"absolute", top:10, right:10, fontSize:14 }}>✅</span>}
                    <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                      <div style={{ fontSize:24, flexShrink:0 }}>{tool.icon}</div>
                      <div>
                        <div style={{ fontWeight:700, color:C.text, fontSize:13, marginBottom:3 }}>{toolLabel}</div>
                        <Tag label={tool.tag} col={tool.color} bg={`${tool.color}15`}/>
                        <div style={{ fontSize:12, color:C.muted, marginTop:5, lineHeight:1.45 }}>{toolDesc.substring(0,85)}…</div>
                      </div>
                    </div>
                    <div style={{ marginTop:10, fontSize:11, color:tool.color, fontWeight:600 }}>{t("toolsOpen")}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════ POLICY BUILDER SECTION ═══════════════
function PolicySection({ esmsData, setFieldValue, openGuide }) {
  const {t}=useLang();
  const[activePol, setActivePol] = useState(null);
  const policies = [
    {
      id:"es_policy_stmt", icon:"📜", label:t("policyLblES"), color:C.navy,
      desc:t("policyDescES"),
      fields:[
        {id:"company_name",label:"Company Name",t:"text",req:true},
        {id:"mission",label:"Company Mission / Vision",t:"ta",rows:3,req:true,ph:"What does your company do and what impact does it aim to have?"},
        {id:"env_commitments",label:"Environmental Commitments",t:"cbl",items:[
          {id:"ewaste",text:"Responsible take-back, recycling and disposal of all end-of-life solar products and batteries"},
          {id:"suppliers_env",text:"Select suppliers based on environmental and social responsibility"},
          {id:"ghg",text:"Minimise greenhouse gas emissions from operations and logistics"},
          {id:"resource",text:"Reduce energy and water consumption in offices, warehouses, and installations"},
          {id:"ewaste_edu",text:"Provide customers with information on safe use and responsible disposal of products"},
          {id:"epr",text:"Fulfil Extended Producer Responsibility (EPR) obligations for end-of-life products"},
          {id:"comply_env",text:"Comply with all applicable environmental laws and regulations"},
        ]},
        {id:"social_commitments",label:"Social Responsibility Commitments",t:"cbl",items:[
          {id:"fair_labour",text:"Ensure safe, fair, and dignified working conditions for all staff, contractors, and agents"},
          {id:"living_wage",text:"Pay fair wages at or above the national minimum; move toward a living wage"},
          {id:"no_child",text:"Zero tolerance for forced labour and child labour in our operations and supply chain"},
          {id:"gender",text:"Promote gender equity and women's participation at all levels of the company"},
          {id:"zero_seah",text:"Zero tolerance for Gender-Based Violence (GBV), Sexual Exploitation, Abuse, and Harassment (SEAH)"},
          {id:"community",text:"Engage fairly and transparently with communities and customers"},
          {id:"access",text:"Ensure affordable and accessible products, especially for underserved and rural communities"},
        ]},
        {id:"governance",label:"Governance & Standards",t:"cbl",items:[
          {id:"laws",text:"Comply with all applicable national laws and regulations in countries of operation"},
          {id:"ifc",text:"Adhere to IFC Performance Standards and World Bank Environmental and Social Framework"},
          {id:"gogla",text:"Commit to the GOGLA Consumer Protection Code"},
          {id:"abc",text:"Zero tolerance for corruption and bribery (Anti-Bribery and Corruption policy)"},
          {id:"reporting",text:"Maintain transparent records and report regularly to investors, lenders, and regulators"},
          {id:"gm_commit",text:"Maintain a Grievance Mechanism accessible to all stakeholders, including for GBV/SEA/SH"},
          {id:"review",text:"Conduct annual review and continuous improvement of our E&S performance"},
        ]},
        {id:"policy_text",label:"Full Policy Statement (draft)",t:"ta",rows:12,ph:"Write your complete E&S Policy Statement here. Use the checklist items above as the basis. This will be signed by your CEO/MD and displayed prominently."},
        {id:"signatory",label:"Signed by (Name, Title, Date)",t:"text",ph:"e.g. Amina Ibrahim, Managing Director | Date: 01/06/2025"},
        {id:"review_freq",label:"Review Frequency",t:"sel",opts:["Annually (minimum)","Every 6 months","After any major incident","Not yet determined"]},
      ]
    },
    {
      id:"hr_policy_stmt", icon:"👥", label:t("policyLblHR"), color:C.navyLight,
      desc:t("policyDescHR"),
      fields:[
        {id:"hr_scope",label:"Scope (who this policy applies to)",t:"ta",rows:2,ph:"All permanent employees, contract workers, casual workers, interns, trainees, and contractors"},
        {id:"eeo",label:"Equal Employment Opportunity",t:"cbl",items:[
          {id:"no_race",text:"No discrimination by race, colour, religion, gender, nationality, age, or disability"},
          {id:"merit",text:"All employment decisions based on merit, skills, and relevant experience"},
          {id:"women_access",text:"Women given equal access to training, promotion, and career advancement"},
          {id:"minority",text:"Actively recruit from underrepresented groups; set diversity targets"},
        ]},
        {id:"work_conditions",label:"Working Conditions & Terms",t:"cbl",items:[
          {id:"contracts",text:"All workers issued written employment contracts before starting work"},
          {id:"min_wage",text:"Wages at or above national minimum wage; annual review against living wage benchmark"},
          {id:"overtime",text:"Overtime is voluntary, compensated at legal premium rate, and within legal maximum hours"},
          {id:"leave",text:"Annual, sick, maternity, and paternity leave provided in accordance with national law"},
          {id:"benefits",text:"Benefits provided (health, pension, transport, etc.) as applicable"},
        ]},
        {id:"rights",label:"Worker Rights",t:"cbl",items:[
          {id:"foa",text:"Right to freedom of association — workers may organise and join workers' organisations without retaliation"},
          {id:"no_forced",text:"No forced labour — workers are never required to surrender identity documents"},
          {id:"no_child_hr",text:"No child labour — minimum age verified for all workers; age-specific work restrictions applied"},
          {id:"safety",text:"Right to a safe and healthy working environment"},
          {id:"dignity",text:"Right to dignity and respect — zero tolerance for harassment or bullying"},
        ]},
        {id:"women_hr",label:"Women's Health, Safety & Inclusion",t:"cbl",items:[
          {id:"sanitary",text:"Clean, private sanitary facilities provided for female workers at all locations"},
          {id:"maternity",text:"Maternity leave and provisions provided per national law (specify enhanced provisions if any)"},
          {id:"seah_policy",text:"Zero tolerance for GBV/SEAH in the workplace with confidential reporting route"},
          {id:"career_women",text:"Equal access to training and promotion for women; gender disaggregated data tracked"},
        ]},
        {id:"grievance_hr",label:"Worker Grievance Mechanism",t:"ta",rows:3,ph:"How can workers raise complaints? What are the channels (including anonymous option)? What is the response timeline? What protection from retaliation is guaranteed?"},
        {id:"hr_signatory",label:"Signed by (Name, Title, Date)",t:"text",ph:"e.g. Fatima Bello, HR Manager | Date: 01/06/2025"},
      ]
    },
    {
      id:"hs_policy_stmt", icon:"⛑️", label:t("policyLblHS"), color:C.red,
      desc:t("policyDescHS"),
      fields:[
        {id:"hs_commitment",label:"Management Commitment Statement",t:"ta",rows:4,ph:"[Company Name] is committed to providing a safe and healthy working environment for all employees, contractors, and visitors. We believe all workplace accidents are preventable. Safety is a condition of employment."},
        {id:"hs_objectives",label:"OHS Objectives",t:"cbl",items:[
          {id:"zero_fat",text:"Achieve zero fatalities"},
          {id:"reduce_lti",text:"Eliminate or minimise all significant OHS risks through the hierarchy of controls"},
          {id:"comply_ohs",text:"Comply with all applicable OHS laws and regulations"},
          {id:"ppe_ohs",text:"Provide adequate PPE and training for all workers"},
          {id:"inspect",text:"Conduct regular workplace inspections and hazard assessments"},
          {id:"investigate",text:"Investigate all incidents and near-misses; implement corrective actions"},
          {id:"committee",text:"Consult workers on OHS matters through the Safety Committee"},
          {id:"improve_ohs",text:"Continuously improve OHS performance year on year"},
        ]},
        {id:"hs_resp",label:"Responsibilities Summary",t:"ta",rows:5,ph:"Management: Provide leadership, resources, and commitment.\nOHS Officer: Develop, implement, and maintain OHS system.\nSupervisors: Ensure workers follow safe procedures; report hazards.\nAll Workers: Follow procedures; use PPE; report hazards and incidents."},
        {id:"hs_signatory",label:"Signed by (Name, Title, Date)",t:"text",ph:"MD Name | Date: DD/MM/YYYY"},
      ]
    },
    {
      id:"consumer_policy_stmt", icon:"🛡️", label:t("policyLblConsumer"), color:C.teal,
      desc:t("policyDescConsumer"),
      fields:[
        {id:"cp_statement",label:"Policy Statement",t:"ta",rows:4,ph:"[Company Name] is committed to the fair, transparent, and respectful treatment of all customers. We adopt the GOGLA Consumer Protection Code as our baseline standard."},
        {id:"cp_principles",label:"Consumer Protection Commitments",t:"cbl",items:[
          {id:"transparency_cp",text:"Transparency — provide complete, accurate, accessible information on products, prices, fees, and terms before sale"},
          {id:"affordability",text:"Responsible Sales — conduct affordability assessments; never sell to customers who cannot afford payments"},
          {id:"no_pressure",text:"Prohibit pressure selling, false capacity claims, and deceptive marketing by all agents"},
          {id:"after_sales",text:"Good Service — provide accessible, timely after-sales support and complaint resolution"},
          {id:"quality_cp",text:"Good Product Quality — only sell products meeting VeraSol/IEC quality standards"},
          {id:"data_privacy_cp",text:"Data Privacy — protect customer data; only collect what is necessary; do not share without consent"},
          {id:"fair_treatment",text:"Fair Treatment — no discrimination by gender, religion, ethnicity, or disability"},
          {id:"debt_cp",text:"No predatory debt collection — no harassment, intimidation, or unauthorised asset seizure"},
          {id:"gogla_cp",text:"Formally commit to the GOGLA Consumer Protection Code (letter to consumerprotection@gogla.org)"},
          {id:"disposal_cp",text:"Inform customers about safe product disposal and end-of-life battery return options"},
        ]},
        {id:"cp_signatory",label:"Signed by (Name, Title, Date)",t:"text",ph:"MD Name | Date: DD/MM/YYYY"},
      ]
    },
    {
      id:"waste_policy_stmt", icon:"♻️", label:t("policyLblWaste"), color:C.green,
      desc:t("policyDescWaste"),
      fields:[
        {id:"waste_statement",label:"Policy Statement",t:"ta",rows:4,ph:"[Company Name] is committed to minimising environmental and health impacts of waste from our operations and products through the 5R principles and Extended Producer Responsibility obligations."},
        {id:"waste_commitments",label:"Waste Management Commitments",t:"cbl",items:[
          {id:"r5_wmp",text:"Apply 5R hierarchy: Reduce → Reuse → Repair → Refurbish → Recycle before considering disposal"},
          {id:"takeback_wmp",text:"Establish and operate a product take-back scheme for end-of-life batteries and panels"},
          {id:"licensed_wmp",text:"Partner exclusively with licensed and certified e-waste recyclers and waste disposal services"},
          {id:"no_dump",text:"Prohibit disposal of hazardous waste in municipal waste streams, open burning, or uncontrolled dumping"},
          {id:"track_wmp",text:"Track and report on volumes of waste collected, recycled, and disposed annually"},
          {id:"educate_wmp",text:"Educate customers on responsible product and battery disposal at point of sale and during maintenance"},
          {id:"comply_wmp",text:"Comply with all applicable waste management, e-waste, and environmental regulations"},
          {id:"informal_wmp",text:"Engage constructively with the informal recycling sector to promote safe handling practices"},
        ]},
        {id:"waste_signatory",label:"Signed by (Name, Title, Date)",t:"text",ph:"MD Name | Date: DD/MM/YYYY"},
      ]
    },
    {
      id:"gender_policy_stmt", icon:"⚡", label:t("policyLblGender"), color:C.purple,
      desc:t("policyDescGender"),
      fields:[
        {id:"gender_statement",label:"Policy Statement",t:"ta",rows:4,ph:"[Company Name] is committed to gender equity and social inclusion. We have zero tolerance for GBV and SEAH. We actively support women's participation in the off-grid solar sector."},
        {id:"gender_commitments",label:"Gender Equity Commitments",t:"cbl",items:[
          {id:"zero_seah_g",text:"Zero tolerance for GBV, SEAH, and all forms of gender-based discrimination"},
          {id:"safe_reporting",text:"Maintain safe, confidential reporting channels for SEAH incidents — separate from general grievance mechanism"},
          {id:"workforce_targets",text:"Set and track targets for women in total workforce, field roles, and management positions"},
          {id:"training_gender",text:"Conduct regular training on gender sensitivity and GBV/SEAH prevention for all staff"},
          {id:"female_customers",text:"Design products and services to meet women's needs — female agents available on request"},
          {id:"gender_data",text:"Collect and report gender-disaggregated data on workforce, customers, and agents"},
          {id:"separate_forums",text:"Hold separate engagement forums for women stakeholders where appropriate"},
          {id:"female_agents",text:"Support female entrepreneurship and employment in the solar value chain"},
        ]},
        {id:"seah_procedure",label:"GBV/SEAH Reporting Procedure",t:"ta",rows:4,ph:"Describe the confidential reporting channel for SEAH: who receives reports, how victims are supported, how investigations are conducted, and what disciplinary action follows."},
        {id:"gender_signatory",label:"Signed by (Name, Title, Date)",t:"text",ph:"MD Name | Date: DD/MM/YYYY"},
      ]
    },
  ];

  if (activePol !== null) {
    const pol = policies[activePol];
    const dataKey = `policy_${pol.id}`;
    const d = esmsData[dataKey] || {};
    const set = (k,v) => setFieldValue(dataKey, k, v);
    return (
      <div>
        <button onClick={() => setActivePol(null)} style={{ ...S.outBtn, marginBottom:20, display:"flex", alignItems:"center", gap:6 }}>
          {t("policiesBack")}
        </button>
        <div style={{ ...S.card, marginBottom:18, borderLeft:`5px solid ${pol.color}` }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-start", flexWrap:"wrap" }}>
            <div style={{ fontSize:28 }}>{pol.icon}</div>
            <div style={{ flex:1 }}>
              <h3 style={{ margin:0, fontFamily:F.d, color:C.text, fontSize:19 }}>{pol.label}</h3>
              <p style={{ margin:"5px 0 0", color:C.muted, fontSize:13 }}>{pol.desc}</p>
            </div>
            <GuideBtn guideId="policy" onOpen={openGuide}/>
          </div>
        </div>
        {pol.fields.map(f => (
          <div key={f.id} style={{ marginBottom:20 }}>
            <Lbl c={f.label} req={f.req}/>
            {f.hint && <Hint c={f.hint}/>}
            {f.t === "text" && <input value={d[f.id]||""} onChange={e=>set(f.id,e.target.value)} placeholder={f.ph||""} style={S.inp}/>}
            {f.t === "ta" && <textarea value={d[f.id]||""} onChange={e=>set(f.id,e.target.value)} placeholder={f.ph||""} rows={f.rows||4} style={S.ta}/>}
            {f.t === "sel" && <select value={d[f.id]||""} onChange={e=>set(f.id,e.target.value)} style={S.inp}><option value="">{t("selectPlaceholder")}</option>{f.opts.map(o=><option key={o}>{o}</option>)}</select>}
            {f.t === "cbl" && <ChecklistBuilder baseline={f.items} value={d[f.id]} onChange={v=>set(f.id,v)}/>}
          </div>
        ))}
        <div style={{ marginTop:24, paddingTop:16, borderTop:`1.5px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <ExportBar
            title={pol.label}
            filename={`Policy_${pol.id}`}
            sections={buildSinglePolicySections(pol, d)}
            esmsData={esmsData}
          />
          <div style={{display:"flex",gap:10}}>
            {activePol > 0 && <button onClick={() => setActivePol(activePol-1)} style={S.outBtn}>← {policies[activePol-1].label}</button>}
            {activePol < policies.length-1 && <button onClick={() => setActivePol(activePol+1)} style={S.btn}>{policies[activePol+1].label} →</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:18, paddingBottom:18, borderBottom:`2px solid ${C.border}` }}>
        <div style={{ fontSize:34 }}>📜</div>
        <div style={{ flex:1 }}>
          <h2 style={{ margin:0, color:C.text, fontSize:22, fontFamily:F.d }}>{t("policiesTitle")}</h2>
          <p style={{ margin:"8px 0 0", color:C.muted, fontSize:14, lineHeight:1.6 }}>{t("policiesDesc")}</p>
        </div>
        <GuideBtn guideId="policy" onOpen={openGuide}/>
      </div>
      <InfoBox col={C.amber} bg="#FFF8ED">{t("policiesInfoBox")}</InfoBox>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:14 }}>
        {policies.map((p,i) => {
          const done = !!(esmsData[`policy_${p.id}`] && Object.keys(esmsData[`policy_${p.id}`]||{}).length > 0);
          return (
            <div key={p.id} onClick={() => setActivePol(i)}
              style={{ ...S.card, borderLeft:`5px solid ${p.color}`, cursor:"pointer", transition:"all 0.15s", position:"relative", borderColor: done ? C.green : C.border, borderWidth:"1.5px 1.5px 1.5px 5px" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}>
              {done && <span style={{ position:"absolute", top:10, right:10, fontSize:14 }}>✅</span>}
              <div style={{ fontSize:26, marginBottom:8 }}>{p.icon}</div>
              <div style={{ fontWeight:700, color:C.text, fontSize:14, marginBottom:4 }}>{p.label}</div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.4 }}>{p.desc}</div>
              <div style={{ marginTop:10, fontSize:12, color:p.color, fontWeight:600 }}>{t("policiesDevelop")}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════ NAV CONFIG ═══════════════
// NAV labels are resolved via t() at render time in App
const NAV_DEFS = [
  { id:"welcome",    icon:"🏠", tKey:"navOverview"  },
  { id:"screening",  icon:"📋", tKey:"navScreening" },
  { id:"policy",     icon:"📜", tKey:"navPolicies"  },
  { id:"risks",      icon:"🔍", tKey:"navRisks"     },
  { id:"compliance", icon:"⚖️", tKey:"navCompliance"},
  { id:"plans",      icon:"⚙️", tKey:"navPlans"     },
  { id:"tools",      icon:"🛠️", tKey:"navTools"     },
  { id:"esap",       icon:"📝", tKey:"navEsap"      },
];

// ═══════════════ MANAGEMENT PLANS SECTION ═══════════════
// (Simplified to keep total code within bounds — sub-plans with key fields)
const PLAN_DEFS_SIMPLE = [
  {
    id:"ohs", icon:"🦺", lk:"planLblOHS", ik:"planIntroOHS", color:C.red,
    required:"IFC PS2 / WB ESS2 | ROGEAP Component 4",
    linkedTools:["ppe_matrix","incident_log","training_register"],
    fields:[
      {id:"scope",label:"Scope & Management Commitment",t:"ta",rows:3,ph:"This plan applies to all employees, contractors, visitors at all company locations and field sites. Safety is a non-negotiable condition of employment."},
      {id:"safety_committee",label:"Safety Committee (Members & Meeting Frequency)",t:"ta",rows:3,ph:"Members: MD (Chair), OHS Officer, Warehouse Supervisor, Field Tech Representative\nMeeting frequency: Monthly + after any incident"},
      {id:"hazard_summary",label:"Key Hazards & Controls Summary",t:"ta",rows:6,ph:"1. WORKING AT HEIGHTS — Controls: Fall arrest harness mandatory; buddy system; ladder inspection checklist\n2. ELECTRICAL HAZARDS — Controls: LOTO before all electrical work; insulated tools; no solo electrical work\n3. BATTERY HAZARDS — Controls: Acid PPE; segregated storage; CO2 extinguisher present\n4. VEHICLE ACCIDENTS — Controls: Driver safety training; GPS tracking; maximum hours policy\n5. GBV/SEAH — Controls: Zero-tolerance policy; Code of Conduct; confidential reporting channel\n[Add others]"},
      {id:"training_ohs",label:"Training Programme Summary",t:"ta",rows:4,ph:"All staff: Safety induction (Day 1); annual refresher\nField technicians: Electrical safety cert; working-at-heights cert; first aid cert\nDrivers: Defensive driving; load securement\nWarehouse: Battery handling; fire safety\nToolbox talks: Before each rooftop job"},
      {id:"incident_proc",label:"Incident Reporting Procedure",t:"ta",rows:4,ph:"Reporting chain: Worker → Supervisor (verbal, immediately) → OHS Officer (written form, within 24hrs) → MD (for serious) → Labour Authority (fatalities/serious injuries, within 48hrs)\nInvestigation: Root cause analysis (5 Whys) within 5 working days. Corrective action plan with named responsible and deadline."},
      {id:"ohs_targets",label:"OHS Performance Targets",t:"ta",rows:3,ph:"• Zero fatalities\n• ≤ 2 lost-time injuries per quarter\n• 100% of field techs with current working-at-heights cert\n• All incidents investigated; corrective actions closed within 30 days"},
    ]
  },
  {
    id:"community_hs", icon:"🏘️", lk:"planLblCommunity", ik:"planIntroCommunity", color:C.green,
    required:"IFC PS4 / WB ESS4 | ROGEAP Component 4",
    linkedTools:["stakeholder_register"],
    fields:[
      {id:"community_map",label:"Affected Community Mapping",t:"ta",rows:4,ph:"List communities affected: location, type of impact, proximity, most affected groups (women, children, elderly)"},
      {id:"product_safety",label:"Product Safety Standards",t:"ta",rows:4,ph:"Electrical safety features in products; labelling and multilingual instructions; quality verification; recall procedure"},
      {id:"installation_safety",label:"Installation Safety in Communities",t:"ta",rows:3,ph:"Site barriers and signage; no children near installation work; community notification before work starts; post-installation safety inspection"},
      {id:"waste_community",label:"Community Waste / E-Waste Impacts",t:"ta",rows:3,ph:"Customer education on battery disposal; take-back scheme publicity; partnership with local collection points"},
      {id:"community_kpis",label:"Community Health & Safety Targets",t:"ta",rows:2,ph:"• Zero community safety incidents from installations per quarter\n• 100% of products shipped with bilingual safety instructions"},
    ]
  },
  {
    id:"consumer", icon:"🛡️", lk:"planLblConsumer", ik:"planIntroConsumer", color:C.teal,
    required:"IFC PS4 | ROGEAP Component 4 | GOGLA Consumer Protection Code",
    linkedTools:["grievance_log"],
    fields:[
      {id:"gogla_status",label:"GOGLA CP Code Commitment Status",t:"ta",rows:2,ph:"Letter of commitment sent: [date] | Self-assessment completed: [date] | Last declaration sent: [date] | Next due: [date]"},
      {id:"transparency_plan",label:"Transparency — Information Provided to Customers",t:"ta",rows:3,ph:"Pre-sale: product specs, pricing breakdown (all fees), payment terms, warranty, data privacy notice\nLanguages: [list languages] | Format: written + verbal handover by agent"},
      {id:"responsible_sales_plan",label:"Responsible Sales — Affordability & Prohibited Behaviours",t:"ta",rows:4,ph:"Affordability check process: [describe]\nProhibited: overstating capacity; pressure selling; selling to customers who cannot afford payments; misrepresenting PAYG terms\nDebt collection policy: no harassment; no seizure beyond the product"},
      {id:"service_plan",label:"Customer Service — After-Sales & Complaints",t:"ta",rows:4,ph:"Support channels: WhatsApp [number]; Email [address]; Service centres [addresses]\nWarranty: [terms]\nComplaints: Acknowledge within 2 working days; resolve within 10 working days; escalation to manager if unresolved"},
      {id:"consumer_kpis",label:"Consumer Protection Targets",t:"ta",rows:3,ph:"• Customer satisfaction score ≥ 85% (quarterly SMS survey)\n• 100% of complaints acknowledged within 2 working days\n• Zero substantiated mis-selling complaints per quarter"},
    ]
  },
  {
    id:"waste", icon:"♻️", lk:"planLblWaste", ik:"planIntroWaste", color:C.green,
    required:"IFC PS3 / WB ESS3 | ROGEAP Component 6",
    linkedTools:["waste_register"],
    fields:[
      {id:"waste_streams",label:"Waste Streams & Volumes (from audit)",t:"ta",rows:4,ph:"Lead-acid batteries: ~[X] units/year | Lithium batteries: ~[X] units/year | Panels EOL: ~[X] units/year | Accessories: ~[X] units/year | Packaging: ~[X] kg/year"},
      {id:"r5_strategy_wmp",label:"5R Strategy by Waste Stream",t:"ta",rows:6,ph:"BATTERIES: Reduce (longer-life products) → Reuse (secondary market) → Repair (reconditioning) → Refurbish (cell salvage) → Recycle ([Recycler name])\nPANELS: Reduce (maintenance to extend life) → Reuse (secondary market) → Recycle ([Recycler or gap])\n[Continue for each stream]"},
      {id:"takeback_wmp",label:"Take-Back Scheme",t:"ta",rows:3,ph:"Collection: Agent collection at maintenance visit; drop-off at [service centre locations]\nIncentive: [e.g. ₦500 credit per battery returned]\nFrequency: Central collection every [X] weeks"},
      {id:"storage_wmp",label:"E-Waste Storage",t:"ta",rows:3,ph:"Location: [describe bunded, ventilated storage area]\nSegregation: Lead-acid separate from lithium; labelled containers; max 60 days before collection\nSafety: Spill kit; CO2 extinguisher; PPE required"},
      {id:"partners_wmp",label:"Disposal & Recycling Partners",t:"ta",rows:3,ph:"Waste Type | Recycler | Registration No. | Collection Frequency | Documentation\nLead-acid | [Name] | NESREA [No.] | Quarterly | Certificate of Recycling"},
      {id:"waste_kpis",label:"Waste Management Targets",t:"ta",rows:3,ph:"• Collect ≥ 80% of batteries sold (by weight) within 2 years of sale\n• Zero batteries in municipal waste (verified by records)\n• 100% of hazardous waste to licensed recycler (cert on file)"},
    ]
  },
  {
    id:"epr", icon:"🚨", lk:"planLblEPR", ik:"planIntroEPR", color:C.red,
    required:"IFC PS2/PS4 | ROGEAP Component 11",
    linkedTools:["incident_log"],
    fields:[
      {id:"scenarios_epr",label:"Emergency Scenarios & Priority",t:"ta",rows:5,ph:"SCENARIO | PROBABILITY | SEVERITY | PRIORITY\nElectrical fire | Medium | High | HIGH\nBattery acid spill | Medium | High | HIGH\nTechnician electrocution | Low | Critical | HIGH\nVehicle accident | Medium | Medium | MEDIUM\nGBV/SEAH incident | Low | High | HIGH\n[Add others from risk assessment]"},
      {id:"ert",label:"Emergency Response Team",t:"ta",rows:4,ph:"Coordinator: [Name] — [Mobile]\nEvacuation Lead: [Name]\nFirst Aid: [Name] (certified)\nCommunications: [Name]\nFire Service: [Number] | Ambulance: 112 | Police: [Number]"},
      {id:"fire_proc_epr",label:"Fire Response Procedure (key steps)",t:"ta",rows:6,ph:"1. Shout FIRE; activate alarm; call fire service [number]\n2. Evacuate via marked exits — do NOT use lifts; close doors behind you\n3. Assembly Point: [location]; supervisor conducts headcount\n4. Battery fires: CO2 or dry powder ONLY — never water on lithium\n5. Do not re-enter until fire service authorises\n6. Complete Incident Report Form within 24hrs"},
      {id:"electrical_epr",label:"Electrical Incident Procedure (key steps)",t:"ta",rows:5,ph:"⚠️ DO NOT TOUCH — isolate power first\n1. Switch off at controller/disconnect; use dry non-conductive object to free person if needed\n2. Call 112; call ERT Coordinator\n3. CPR if trained and not breathing; do not give food/water\n4. Report to OHS Officer within 1hr; complete form before end of day"},
      {id:"battery_epr",label:"Battery Emergency Procedure (key steps)",t:"ta",rows:4,ph:"ACID SPILL: Evacuate area; PPE on; neutralise with baking soda; use spill kit; flush skin/eyes with water 15 min; report\nLITHIUM FIRE: DO NOT use water; evacuate; call fire service (alert: lithium involved); CO2 only for surrounding fire"},
      {id:"drills_epr",label:"Drill Schedule & Records",t:"ta",rows:2,ph:"Full evacuation drill: [frequency] | Battery/spill drill: [frequency] | Last drill: [date] | Next drill: [date]"},
    ]
  },
  {
    id:"hr_plan", icon:"👷", lk:"planLblHR", ik:"planIntroHR", color:C.navyLight,
    required:"IFC PS2 / WB ESS2 | ROGEAP Component 5",
    linkedTools:["training_register"],
    fields:[
      {id:"workforce",label:"Current Workforce Profile",t:"ta",rows:2,ph:"Permanent: [X] | Contract: [X] | Casual: [X] | Contractors: [X] | % Female: [X]%"},
      {id:"recruitment_hr",label:"Recruitment & Equal Opportunity Process",t:"ta",rows:3,ph:"Advertise vacancies publicly; selection based on merit; age verification for all workers; diversity targets: [X]% women overall, [Y]% in field/technical roles"},
      {id:"wages_hr",label:"Wages, Hours & Benefits",t:"ta",rows:4,ph:"Min wage: [amount] | Company rate: [X]% above minimum | Last wage review: [date]\nHours: [X/day, Y/week] | Overtime: voluntary, [X]% premium, max [Y] hrs/week\nBenefits: [list]"},
      {id:"women_plan",label:"Women's Health, Safety & Inclusion",t:"ta",rows:3,ph:"Sanitary facilities: [describe] | Maternity: [X weeks paid]\nSEAH reporting route: confidential to [Name/role] | Support: [counselling, leave, referral]\nTargets: [X]% women in field roles by [year]"},
      {id:"coc_rollout",label:"Code of Conduct Rollout",t:"ta",rows:3,ph:"All staff sign CoC before starting work (language understood confirmed); signed copies filed in HR folder\nAnnual refresher training; refresher after any SEAH incident\nContractors required to sign as part of contract agreement"},
    ]
  },
  {
    id:"sep_plan", icon:"🤝", lk:"planLblSEP", ik:"planIntroSEP", color:C.purple,
    required:"WB ESS10 | IFC PS1 | ROGEAP Component 7",
    linkedTools:["stakeholder_register","grievance_log"],
    fields:[
      {id:"sep_objectives",label:"Stakeholder Engagement Objectives",t:"ta",rows:2,ph:"1. Identify and address community concerns before they escalate\n2. Ensure women and vulnerable groups are meaningfully included\n3. Build trust and social licence to operate in service areas"},
      {id:"key_engagement",label:"Key Engagement Activities by Group",t:"ta",rows:7,ph:"CUSTOMERS: Ongoing — agent handover, SMS surveys, complaints hotline, social media\nLOCAL COMMUNITIES: Quarterly — community meetings before installations, feedback boxes, liaison visits\nREGULATORS: Quarterly — formal meetings, annual compliance reports\nINVESTORS/ROGEAP: Quarterly — E&S reporting per agreement format\nSUPPLIERS: Annually — supplier assessment, contractual E&S requirements\nEMPLOYEES: Ongoing — team meetings, safety committee, HR grievance mechanism"},
      {id:"fpic_sep",label:"Free, Prior, and Informed Consent (FPIC)",t:"ta",rows:3,ph:"Free: No coercion; engagement at reasonable times; power imbalance managed\nPrior: Communities engaged before installation activities begin in new areas\nInformed: Information in local languages; visual formats for low literacy; questions welcomed"},
      {id:"gender_sep",label:"Gender-Inclusive Engagement",t:"ta",rows:3,ph:"Separate forums for women in community meetings; female liaison officers deployed in areas with cultural barriers; meeting times suitable for women's schedules; female customer feedback tracked separately"},
      {id:"sep_records",label:"Documentation & Reporting Back",t:"ta",rows:3,ph:"Engagement Register: date, location, attendees, topics discussed, concerns raised, company commitments, follow-up actions and dates\nReport back to communities on outcomes annually or after major engagements"},
    ]
  },
];

function ManagementPlansSection({ esmsData, setFieldValue, openGuide }) {
  const {t}=useLang();
  const [active, setActive] = useState(null);

  const hasData = (id) => {
    const d = esmsData[`plan_${id}`] || {};
    return Object.keys(d).length > 0;
  };

  if (active !== null) {
    const plan = PLAN_DEFS_SIMPLE[active];
    const dataKey = `plan_${plan.id}`;
    const d = esmsData[dataKey] || {};
    const set = (k,v) => setFieldValue(dataKey, k, v);
    return (
      <div>
        <button onClick={() => setActive(null)} style={{ ...S.outBtn, marginBottom:18, display:"flex", alignItems:"center", gap:6 }}>{t("plansBack")}</button>
        <div style={{ ...S.card, marginBottom:18, borderLeft:`5px solid ${plan.color}` }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-start", flexWrap:"wrap" }}>
            <div style={{ fontSize:30 }}>{plan.icon}</div>
            <div style={{ flex:1 }}>
              <h3 style={{ margin:0, fontFamily:F.d, color:C.text, fontSize:19 }}>{t(plan.lk)}</h3>
              <div style={{ marginTop:4 }}><Tag label={plan.required} col={plan.color} bg={`${plan.color}15`}/></div>
              <p style={{ margin:"8px 0 0", color:C.muted, fontSize:13, lineHeight:1.5 }}>{t(plan.ik)}</p>
            </div>
            <GuideBtn guideId="plans" onOpen={openGuide}/>
          </div>
          {plan.linkedTools?.length > 0 && (
            <div style={{ marginTop:10, padding:"8px 12px", background:"#F8FAFD", borderRadius:7, fontSize:12 }}>
              <span style={{ fontWeight:700, color:C.navy }}>{t("plansSupportingTools")} </span>
              {plan.linkedTools.map(tk => TOOLS_REGISTRY[tk]).filter(Boolean).map(tk => (
                <span key={tk.id} style={{ background:`${tk.color}18`, color:tk.color, borderRadius:5, padding:"2px 8px", marginLeft:6, fontWeight:600 }}>{tk.icon} {t(tk.lk)}</span>
              ))}
              <span style={{ color:C.muted, marginLeft:6 }}>{t("plansToolsNote")}</span>
            </div>
          )}
        </div>
        <InfoBox col={C.amber} bg="#FFF8ED">{t("plansTip")}</InfoBox>
        {plan.fields.map(f => (
          <div key={f.id} style={{ marginBottom:20 }}>
            <Lbl c={f.label} req={f.req}/>
            {f.hint && <Hint c={f.hint}/>}
            {f.t === "text" && <input value={d[f.id]||""} onChange={e=>set(f.id,e.target.value)} placeholder={f.ph||""} style={S.inp}/>}
            {f.t === "ta" && <textarea value={d[f.id]||""} onChange={e=>set(f.id,e.target.value)} placeholder={f.ph||""} rows={f.rows||4} style={S.ta}/>}
            {f.t === "cbl" && <ChecklistBuilder baseline={f.items||[]} value={d[f.id]} onChange={v=>set(f.id,v)}/>}
          </div>
        ))}
        <div style={{ marginTop:24, paddingTop:16, borderTop:`1.5px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <ExportBar
            title={t(plan.lk)}
            filename={`Plan_${plan.id}`}
            sections={buildSinglePlanSections(plan, d, t)}
            esmsData={esmsData}
          />
          <div style={{display:"flex",gap:10}}>
            {active > 0 && <button onClick={() => setActive(active-1)} style={S.outBtn}>← {t(PLAN_DEFS_SIMPLE[active-1].lk)}</button>}
            {active < PLAN_DEFS_SIMPLE.length-1 && <button onClick={() => setActive(active+1)} style={S.btn}>{t(PLAN_DEFS_SIMPLE[active+1].lk)} →</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:18, paddingBottom:18, borderBottom:`2px solid ${C.border}` }}>
        <div style={{ fontSize:34 }}>⚙️</div>
        <div style={{ flex:1 }}>
          <h2 style={{ margin:0, color:C.text, fontSize:22, fontFamily:F.d }}>{t("plansTitle")}</h2>
          <p style={{ margin:"8px 0 0", color:C.muted, fontSize:14, lineHeight:1.6 }}>{t("plansDesc")}</p>
        </div>
        <GuideBtn guideId="plans" onOpen={openGuide}/>
      </div>
      <InfoBox col={C.amber} bg="#FFF8ED">{t("plansInfoBox")}</InfoBox>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:14 }}>
        {PLAN_DEFS_SIMPLE.map((p, i) => {
          const done = hasData(p.id);
          return (
            <div key={p.id} onClick={() => setActive(i)}
              style={{ ...S.card, borderLeft:`5px solid ${p.color}`, cursor:"pointer", transition:"all 0.15s", position:"relative", borderColor: done ? C.green : C.border, borderWidth:"1.5px 1.5px 1.5px 5px" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}>
              {done && <span style={{ position:"absolute", top:10, right:10, fontSize:14 }}>✅</span>}
              <div style={{ fontSize:26, marginBottom:6 }}>{p.icon}</div>
              <div style={{ fontWeight:700, color:C.text, fontSize:14, marginBottom:3 }}>{t(p.lk)}</div>
              <div style={{ fontSize:11, color:p.color, marginBottom:5, fontWeight:600 }}>{p.required}</div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.4 }}>{t(p.ik).substring(0,80)}…</div>
              {p.linkedTools?.length > 0 && (
                <div style={{ marginTop:8, fontSize:11, color:C.muted }}>
                  🛠️ Tools: {p.linkedTools.map(tk => TOOLS_REGISTRY[tk]?.icon).filter(Boolean).join(" ")}
                </div>
              )}
              <div style={{ marginTop:8, fontSize:12, color:p.color, fontWeight:600 }}>{t("plansDevelop")}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════ RISK SECTION ═══════════════
const BASELINE_RISKS = [
  {risk:"Workers fall from rooftop during installation or maintenance",category:"OHS",prob:"3",sev:"4",mitigation:"Fall arrest harness; certified working-at-heights training; buddy system; ladder inspection checklist",responsible:"",status:"Planned"},
  {risk:"Electric shock / electrocution from live DC or AC system",category:"OHS",prob:"2",sev:"4",mitigation:"LOTO procedures; insulated tools; EN60903 Class 1 gloves; no solo electrical work",responsible:"",status:"Planned"},
  {risk:"Lead-acid battery acid burns or chemical exposure",category:"OHS",prob:"2",sev:"3",mitigation:"Acid-resistant PPE; bunded storage; spill kit; training on safe handling",responsible:"",status:"Planned"},
  {risk:"Lithium battery thermal runaway or fire",category:"OHS",prob:"1",sev:"4",mitigation:"Safe storage (temperature-controlled); fire-resistant packaging; CO2 extinguisher; no puncture/crush",responsible:"",status:"Planned"},
  {risk:"Vehicle accident during field transportation",category:"OHS",prob:"3",sev:"3",mitigation:"Driver training; GPS tracking; maximum driving hours policy; vehicle maintenance schedule",responsible:"",status:"Planned"},
  {risk:"GBV / Sexual Exploitation, Abuse, and Harassment (SEAH) in workplace",category:"Gender/SEAH",prob:"2",sev:"4",mitigation:"Zero-tolerance policy; Code of Conduct; confidential reporting channel; training; investigation procedure",responsible:"",status:"Planned"},
  {risk:"Improper disposal of lead-acid batteries causing soil and water contamination",category:"E-Waste",prob:"3",sev:"4",mitigation:"Take-back scheme; agent collection incentives; licensed recycler partnership; customer education",responsible:"",status:"Planned"},
  {risk:"Solar panels disposed of improperly at end of life",category:"E-Waste",prob:"2",sev:"3",mitigation:"Panel take-back programme; partnership with panel recycler; customer disposal guidance",responsible:"",status:"Planned"},
  {risk:"Mis-selling of products to customers who cannot afford payments",category:"Consumer",prob:"3",sev:"3",mitigation:"Affordability assessment; prohibited selling behaviours list; agent training; customer satisfaction surveys",responsible:"",status:"Planned"},
  {risk:"Products sold without adequate safety instructions",category:"Consumer",prob:"2",sev:"3",mitigation:"Multilingual quick-start guide; safety card in every box; agent customer handover training",responsible:"",status:"Planned"},
  {risk:"Workers paid below minimum wage or lack written contracts",category:"Labour",prob:"2",sev:"3",mitigation:"Written contracts for all workers; wage review against national minimum; HR audit",responsible:"",status:"Planned"},
  {risk:"No grievance mechanism accessible to workers",category:"Labour",prob:"2",sev:"3",mitigation:"Worker grievance mechanism established; anonymous option available; anti-retaliation policy",responsible:"",status:"Planned"},
  {risk:"Child labour in product supply chain (panel manufacturing)",category:"Supply Chain",prob:"1",sev:"4",mitigation:"Supplier E&S assessment; RBA/ILO compliant suppliers prioritised; due diligence questionnaire",responsible:"",status:"Planned"},
  {risk:"Community injury from falling objects during installation",category:"Community",prob:"2",sev:"3",mitigation:"Site barriers; no access during rooftop work; community notification; post-install inspection",responsible:"",status:"Planned"},
  {risk:"Data breach or misuse of customer personal information",category:"Consumer",prob:"1",sev:"3",mitigation:"Data privacy policy; access controls; data minimisation; customer consent procedures",responsible:"",status:"Planned"},
];

function RiskSection({ esmsData, setFieldValue, openGuide }) {
  const {t}=useLang();
  const val = esmsData["risk_register"]?.data;
  const set = (v) => setFieldValue("risk_register", "data", v);
  return (
    <div>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:18, paddingBottom:18, borderBottom:`2px solid ${C.border}` }}>
        <div style={{ fontSize:34 }}>🔍</div>
        <div style={{ flex:1 }}>
          <h2 style={{ margin:0, color:C.text, fontSize:22, fontFamily:F.d }}>{t("risksTitle")}</h2>
          <p style={{ margin:"8px 0 0", color:C.muted, fontSize:14, lineHeight:1.6 }}>{t("risksDesc")}</p>
        </div>
        <GuideBtn guideId="risks" onOpen={openGuide}/>
      </div>
      <InfoBox col={C.red} bg="#FFF5F5">{t("risksInfoBox")}</InfoBox>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        <ExportBar title="Risk Register" filename="ESMS_Risk_Register"
          sections={buildRiskSections(esmsData)} csvToolId="risk_matrix" esmsData={esmsData}/>
      </div>
      <RiskMatrix baselineRisks={BASELINE_RISKS} value={val} onChange={set}/>
    </div>
  );
}

// ═══════════════ COMPLIANCE SECTION ═══════════════
function ComplianceSection({ esmsData, setFieldValue, openGuide }) {
  const {t}=useLang();
  const val = esmsData["compliance_tracker"]?.data;
  const set = (v) => setFieldValue("compliance_tracker", "data", v);
  return (
    <div>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:18, paddingBottom:18, borderBottom:`2px solid ${C.border}` }}>
        <div style={{ fontSize:34 }}>⚖️</div>
        <div style={{ flex:1 }}>
          <h2 style={{ margin:0, color:C.text, fontSize:22, fontFamily:F.d }}>{t("complianceTitle")}</h2>
          <p style={{ margin:"8px 0 0", color:C.muted, fontSize:14, lineHeight:1.6 }}>{t("complianceDesc")}</p>
        </div>
        <GuideBtn guideId="compliance" onOpen={openGuide}/>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        <ExportBar title="Compliance Register" filename="ESMS_Compliance"
          sections={buildComplianceSections(esmsData,t)} csvToolId="compliance" esmsData={esmsData}/>
      </div>
      <ComplianceTracker value={val} onChange={set}/>
    </div>
  );
}

// ═══════════════ SCREENING SECTION ═══════════════
function ScreeningSection({ esmsData, setFieldValue, openGuide }) {
  const {t}=useLang();
  const val = esmsData["screening_q"];
  const set = (v) => setFieldValue("screening_q", "data", v);
  return (
    <div>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:18, paddingBottom:18, borderBottom:`2px solid ${C.border}` }}>
        <div style={{ fontSize:34 }}>📋</div>
        <div style={{ flex:1 }}>
          <h2 style={{ margin:0, color:C.text, fontSize:22, fontFamily:F.d }}>{t("screeningTitle")}</h2>
          <p style={{ margin:"8px 0 0", color:C.muted, fontSize:14, lineHeight:1.6 }}>{t("screeningDesc")}</p>
        </div>
        <GuideBtn guideId="screening" onOpen={openGuide}/>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        <ExportBar title="E&S Screening Questionnaire" filename="ESMS_Screening"
          sections={buildScreeningSections(esmsData)} esmsData={esmsData}/>
      </div>
      <ScreeningQuestionnaire value={val?.data} onChange={v => set(v)}/>
    </div>
  );
}

// ═══════════════ WELCOME ═══════════════
function Welcome({ esmsData, setActive, openGuide, nav }) {
  const {t}=useLang();
  const navList = nav || NAV_DEFS;
  const completedSections = navList.filter(n => n.id !== "welcome").filter(n => {
    if (n.id === "tools") return Object.keys(TOOLS_REGISTRY).some(t => !!(esmsData[`tool_${t}`]?.data));
    if (n.id === "policy") return PLAN_DEFS_SIMPLE.some(p => !!(esmsData[`policy_${p.id}`] && Object.keys(esmsData[`policy_${p.id}`]||{}).length > 0));
    if (n.id === "plans") return PLAN_DEFS_SIMPLE.some(p => !!(esmsData[`plan_${p.id}`] && Object.keys(esmsData[`plan_${p.id}`]||{}).length > 0));
    if (n.id === "risks") return !!(esmsData["risk_register"]?.data);
    if (n.id === "compliance") return !!(esmsData["compliance_tracker"]?.data);
    if (n.id === "screening") return !!(esmsData["screening_q"]?.data);
    if (n.id === "esap") return !!(esmsData["tool_esap"]?.data?.length);
    return false;
  }).length;
  const total = navList.filter(n => n.id !== "welcome").length;

  return (
    <div>
      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 200px", background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, borderRadius:14, padding:"20px 22px", color:"white" }}>
          <div style={{ fontSize:28 }}>☀️</div>
          <div style={{ fontWeight:700, fontSize:17, margin:"8px 0 4px", fontFamily:F.d }}>OGS ESMS Builder</div>
          <div style={{ fontSize:11, opacity:0.7 }}>ROGEAP-aligned | IFC Performance Standards</div>
        </div>
        <div style={{ flex:"1 1 190px", ...S.card, padding:"20px 22px" }}>
          <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:8 }}>{t("welcomeSectionsActive")}</div>
          <div style={{ fontSize:36, fontWeight:700, color: completedSections===total ? C.green : C.navy }}>{completedSections} / {total}</div>
          <div style={{ background:C.bg, borderRadius:5, height:6, marginTop:8, overflow:"hidden" }}>
            <div style={{ width:`${(completedSections/total)*100}%`, background: completedSections===total ? C.green : C.amber, height:"100%", borderRadius:5 }}/>
          </div>
        </div>
        <div style={{ flex:"1 1 190px", ...S.card, padding:"20px 22px" }}>
          <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:8 }}>{t("welcomeToolsUsed")}</div>
          <div style={{ fontSize:36, fontWeight:700, color:C.teal }}>
            {Object.keys(TOOLS_REGISTRY).filter(tk => !!(esmsData[`tool_${tk}`]?.data)).length} / {Object.keys(TOOLS_REGISTRY).length}
          </div>
          <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{t("welcomeRegistersActive")}</div>
        </div>
      </div>
      <h2 style={{ fontFamily:F.d, color:C.text, marginBottom:6, fontWeight:400 }}>{t("welcomeTitle")}</h2>
      <p style={{ color:C.muted, lineHeight:1.7, fontSize:14, marginBottom:20 }}>{t("welcomeDesc")}</p>
      <InfoBox col={C.amber} bg="#FFF8ED">{t("welcomeComponents")}</InfoBox>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(190px,1fr))", gap:10 }}>
        {navList.filter(n => n.id !== "welcome").map(n => {
          let done = false;
          if (n.id === "tools") done = Object.keys(TOOLS_REGISTRY).some(t => !!(esmsData[`tool_${t}`]?.data));
          else if (n.id === "plans") done = PLAN_DEFS_SIMPLE.some(p => !!(esmsData[`plan_${p.id}`] && Object.keys(esmsData[`plan_${p.id}`]||{}).length > 0));
          else if (n.id === "policy") done = !!(esmsData["policy_es_policy_stmt"] && Object.keys(esmsData["policy_es_policy_stmt"]||{}).length > 0);
          else if (n.id === "risks") done = !!(esmsData["risk_register"]?.data);
          else if (n.id === "compliance") done = !!(esmsData["compliance_tracker"]?.data);
          else if (n.id === "esap") done = !!(esmsData["tool_esap"]?.data?.length);
          return (
            <div key={n.id} onClick={() => setActive(n.id)}
              style={{ ...S.card, cursor:"pointer", border:`2px solid ${done ? C.green : C.border}`, transition:"all 0.12s", position:"relative", textAlign:"center", padding:"16px 14px" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              {done && <span style={{ position:"absolute", top:8, right:8, fontSize:13 }}>✅</span>}
              <div style={{ fontSize:24, marginBottom:6 }}>{n.icon}</div>
              <div style={{ fontWeight:700, fontSize:12, color:C.text }}>{n.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
//  GUIDELINES KNOWLEDGE BASE
//  Sourced from: ROGEAP ESMS Guidelines v01, IFC ESMS Toolkit
//  General (2015), IFC Performance Standards (2012)
// ═══════════════════════════════════════════════════════════

const GUIDELINES_DB = {

  // ── SCREENING ──────────────────────────────────────────────
  screening: {
    id: "screening",
    title: "E&S Screening Questionnaire",
    color: "#1A3A5C",
    rogeapRef: "ROGEAP ESMS Guidelines §4 (pp.27-30) — Table 6",
    ifcRef: "IFC PS1 §14-18 — Assessment & Management of E&S Risks",
    summary: "The ROGEAP E&S Screening Questionnaire is the entry-point assessment for all companies applying for ROGEAP financing. It determines ESMS maturity across five domains and flags any exclusion criteria that would disqualify a company from funding. It is directly reproduced from Table 6 of the ROGEAP ESMS Guidelines.",
    sections: [
      {
        heading: "Purpose and ROGEAP Requirement",
        body: "All companies applying for ROGEAP grants or loans must complete the Screening Questionnaire as part of the Expression of Interest (EOI) and Due Diligence stages. The questionnaire serves two functions: (1) identifying automatic disqualification criteria (exclusion criteria), and (2) assessing the company's existing ESMS maturity to inform what must be developed or improved before financing is approved.\n\nCompanies are classified as: Not Eligible (exclusion criteria met), Category B1 — Low Risk (minimal adverse impact; basic ESMS components required), or Category B2 — Medium Risk (requires an ESAP and close monitoring)."
      },
      {
        heading: "Exclusion Criteria — Section C1",
        body: "A single 'Yes' answer to any exclusion criterion automatically disqualifies the company from ROGEAP financing. The criteria include: forced labour, child labour, non-Basel-compliant cross-border waste trade, confirmed OHS incidents/accidents (unless properly documented and remediated), confirmed GBV/Sexual Exploitation and Abuse, and confirmed discrimination of vulnerable groups.\n\nNote on OHS Incidents: Companies with confirmed OHS incidents may still qualify IF they can demonstrate with documentation that the issues were adequately addressed and verified. The same principle applies to GBV/SEAH cases.\n\nSource: ROGEAP ESMS Guidelines, Table 6, Section C — p.27-28."
      },
      {
        heading: "ESMS & Policy Assessment — Section C2",
        body: "This section assesses whether the company has foundational E&S management instruments in place: an E&S Policy, HR Policy (with non-discrimination, no child labour, no forced labour provisions), and a worker grievance mechanism. Companies lacking these must develop them as ESAP commitments within the grant agreement timeline.\n\nThe IFC ESMS Toolkit Element 1 (Policy) states that a written policy should be the 'foundation of your ESMS' and must include a commitment to comply with applicable legislation, meet PS requirements, and improve E&S performance over time."
      },
      {
        heading: "OHS Assessment — Section C3",
        body: "The OHS assessment checks whether the company has: a documented OHS policy or guidelines, designated OHS staff, PPE provision, regular OHS training, a documented incident/accident tracking system, a Code of Conduct, GBV training, and an OHS monitoring system. These map directly onto the ROGEAP OHS Plan requirements in Section 8 of the Guidelines.\n\nIFC PS2 requires that companies identify and assess risks to worker health and safety, implement control measures using the hierarchy of controls (eliminate → substitute → engineer → administer → PPE), and monitor performance."
      },
      {
        heading: "E-Waste Assessment — Section C4",
        body: "E-waste is the highest-priority environmental risk in the OGS sector. The screening checks for: a battery collection policy/process, a recycling/disposal process for lead-acid and lithium-ion batteries, buy-back agreements with manufacturers, systematic collection from consumers, and customer education on e-waste.\n\nIFC PS3 (Resource Efficiency and Pollution Prevention) requires companies to avoid releasing pollutants due to routine operations, avoid the generation of hazardous waste, and ensure responsible disposal of hazardous waste. Improper disposal of lead-acid batteries is a direct violation of PS3 and may constitute illegal dumping under most national environmental laws in ROGEAP countries."
      },
      {
        heading: "Stakeholder Engagement & GRM Assessment — Section C5",
        body: "The SEP/GRM section assesses whether the company has: a Stakeholder Engagement Plan, stakeholder identification processes, public education activities, community engagement events, and a written complaint mechanism. WB ESS10 requires all supported businesses to have a SEP and a Grievance Mechanism, including a specific process for GBV/SEA/SH complaints.\n\nThe ROGEAP Operational Manual specifies that GBV/SEA/SH complaints must be handled confidentially, quickly (within 72 hours), under a survivor-centred approach, with referral pathways to medical, psychosocial, and legal services."
      }
    ],
    resources: [
      { label: "__ROGEAP_GUIDELINES_LABEL__", url: "__ROGEAP_GUIDELINES_PDF__" },
      { label: "IFC Performance Standards (2012)", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "IFC ESMS Toolkit — General (2015)", url: "https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
      { label: "FIRST for Sustainability — Managing E&S Risks", url: "https://firstforsustainability.org/managing-environmental-and-social-risk" },
      { label: "ROGEAP Operational Manual", url: "https://ecowas.rogeap.org/wp-content/uploads/2023/10/GRM-Operational-Manual-ROGEAP-ECOWAS.pdf" },
    ]
  },

  // ── POLICY ─────────────────────────────────────────────────
  policy: {
    id: "policy",
    title: "Organisational Policies",
    color: "#1A3A5C",
    rogeapRef: "ROGEAP ESMS Guidelines §3 (pp.15-18) — E&S Policy",
    ifcRef: "IFC ESMS Toolkit Element 1 — Policy; IFC PS1, PS2, PS3, PS4",
    summary: "Policies are the governance foundation of your ESMS. They communicate management's commitment to environmental and social responsibility to all stakeholders — staff, customers, investors, and regulators. The ROGEAP guidelines require a minimum of: an E&S Policy, HR Policy (with Code of Conduct), a health and safety policy or procedure, a waste management policy, and a consumer protection commitment. All must be signed by senior management.",
    sections: [
      {
        heading: "What Makes a Policy Effective",
        body: "The IFC ESMS Toolkit identifies three conditions for an effective policy: (1) Awareness — management, staff and stakeholders understand the E&S policy and the environmental and social issues of relevance; (2) Commitment — management and staff are committed to operating in accordance with the policy ('buy-in'); (3) Implementation — the policy is driven through day-to-day practice via plans, procedures, assigned responsibilities, training, and allocated resources.\n\nA policy that exists only as a document is not an implemented policy. ROGEAP reviewers and DFI investors will ask for evidence that the policy has been communicated to staff, is displayed in the workplace, and is reflected in operational practices."
      },
      {
        heading: "E&S Policy — ROGEAP Requirements",
        body: "The E&S Policy is ROGEAP Component 1 and must be in place for all applicants, though complexity scales with business maturity:\n\nStage 1 (Start-Up): Basic, high-level sustainability commitment in company documentation.\nStage 2 (Early-Stage): Documented policy outlining key E&S principles, goals, and commitments reflecting company values.\nStage 3 (Growth-Maturity): Comprehensive E&S policy aligned with international standards (ISO 14001), including quantitative targets integrated into business strategy.\n\nAt minimum, the ROGEAP E&S Policy should address: legal compliance (national laws and ROGEAP standards), environmental stewardship (waste, resources), social responsibility (labour, community, gender), and governance (anti-corruption, GRM). A zero-tolerance statement for GBV/SEAH is explicitly required.\n\nSource: ROGEAP ESMS Guidelines, Section 3, pp.15-18; Box 1 sample policy statement."
      },
      {
        heading: "HR Policy — IFC PS2 Requirements",
        body: "IFC Performance Standard 2 (Labour and Working Conditions) requires that businesses maintain an HR policy covering: terms and conditions of employment, non-discrimination and equal opportunity, prohibition of child labour and forced labour, freedom of association, fair wages, working hours, and a worker grievance mechanism.\n\nThe ROGEAP guidelines add: the HR Policy must include a Code of Conduct for all workers and subcontractors addressing GBV/SEAH, non-discrimination, and safety compliance. All workers — including contractors and casual workers — must sign the Code of Conduct before starting work. Signed copies must be kept on file.\n\nIFC PS2 §7 defines 'workers' as including direct employees, contracted workers, primary supply chain workers, and community workers."
      },
      {
        heading: "Waste Management Policy — IFC PS3",
        body: "IFC Performance Standard 3 (Resource Efficiency and Pollution Prevention and Management) requires companies to avoid generating hazardous and non-hazardous waste; where waste cannot be avoided, reduce, reuse, recover, recycle, and treat waste before disposal. For OGS companies, the primary waste concern is lead-acid and lithium-ion batteries, which are classified as hazardous waste under most national frameworks and international conventions.\n\nThe Waste Management Policy must demonstrate commitment to: Extended Producer Responsibility (EPR), partnership with certified recyclers, prohibition of open dumping or burning, and customer education on responsible disposal. The ROGEAP guidelines cite the GOGLA E-Waste Toolkit as a key resource for OGS companies.\n\nSource: ROGEAP ESMS Guidelines, Section 10, pp.72-79."
      },
      {
        heading: "Consumer Protection Policy — GOGLA Code",
        body: "The GOGLA Consumer Protection Code is the sector benchmark for OGS companies. It is built on six principles: Transparency, Responsible Sales and Pricing, Good Consumer Service, Good Product Quality, Data Privacy, and Fair and Respectful Treatment. Companies that commit to the Code send a signed letter to GOGLA (consumerprotection@gogla.org) and complete a self-assessment within three months.\n\nIFC PS4 (Community Health, Safety and Security) underpins consumer protection in the ESMS framework — requiring companies to proactively identify and prevent risks to the health and safety of communities arising from their products and services.\n\nSource: ROGEAP ESMS Guidelines, Section 8 (Consumer Protection), pp.61-63; GOGLA Consumer Protection Code."
      }
    ],
    resources: [
      { label: "IFC ESMS Toolkit Element 1 — Policy", url: "https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
      { label: "IFC Performance Standard 2 — Labour and Working Conditions", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "IFC Performance Standard 3 — Resource Efficiency & Pollution Prevention", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "GOGLA Consumer Protection Code", url: "https://www.gogla.org/what-we-do/business-services-and-standards/consumer-protection-code/" },
      { label: "GOGLA ESMS Guidelines for OGS Companies", url: "https://www.gogla.org/wp-content/uploads/2020/02/ESMS-Guidelines-for-Off-Grid-Solar-Companies.pdf" },
      { label: "REA Nigeria — ESMS Template for OGS", url: "https://rea.gov.ng/NEP-ESMS-Template_REVISED-25022020.pdf" },
    ]
  },

  // ── RISKS ──────────────────────────────────────────────────
  risks: {
    id: "risks",
    title: "E&S Risk Identification & Assessment",
    color: "#C0392B",
    rogeapRef: "ROGEAP ESMS Guidelines §4 (pp.19-31) — Risk Identification",
    ifcRef: "IFC ESMS Toolkit Element 2 — Risk Identification; IFC PS1",
    summary: "Risk assessment is the engine of your ESMS — it determines what you need to manage, at what priority, and with what resources. The ROGEAP guidelines use a probability × severity matrix to rate risks from LOW (1) to CRITICAL (16). For OGS companies, the highest-priority risks are consistently: battery e-waste, working at heights, electrical hazards, GBV/SEAH, and mis-selling to vulnerable consumers.",
    sections: [
      {
        heading: "ROGEAP Risk Assessment Approach",
        body: "The ROGEAP guidelines describe a two-stage risk assessment process: (1) Screening — a simplified checklist-type assessment to categorise the company's overall E&S risk level (Low/Medium/High); (2) Detailed Assessment — a scored risk register where each identified risk is assigned a Probability rating (1-4) and a Severity/Impact rating (1-4).\n\nRisk Rating = Probability × Severity:\n• 1-2: LOW — monitor, no urgent action\n• 3-5: MEDIUM — implement controls within agreed timeframe\n• 6-8: HIGH — prioritise; action within 30 days\n• 9-16: CRITICAL — immediate action required\n\nSource: ROGEAP ESMS Guidelines, Section 4, pp.19-31; risk matrix diagram."
      },
      {
        heading: "Key OGS Risk Categories",
        body: "The ROGEAP Guidelines (Table 5, pp.23-26) identify the following key risk categories for OGS companies:\n\n1. E-WASTE (High probability / High impact): Improper disposal of lead-acid and lithium-ion batteries causes lead poisoning and soil/water contamination. This is the highest-priority environmental risk for OGS.\n\n2. OHS — WORKING AT HEIGHTS (High probability / High impact): Falls during rooftop installation and maintenance are the most common cause of serious injury in the solar installation sector.\n\n3. OHS — ELECTRICAL HAZARDS (Medium probability / Critical impact): Electric shock and arc flash during installation and maintenance of live DC/AC systems.\n\n4. GENDER / GBV / SEAH (Medium probability / High impact): Applies both within the workplace and during field operations involving customer interactions in community settings.\n\n5. LABOUR (Medium probability / High impact): Terms of employment, child labour risk in supply chains, and lack of worker grievance mechanisms.\n\n6. CONSUMER PROTECTION (High probability / High impact): Mis-selling to low-income rural customers, including overstating product capacity and selling to customers who cannot afford payments."
      },
      {
        heading: "Root Cause Analysis",
        body: "The ROGEAP guidelines emphasise that after rating risks, companies should conduct root cause analysis (RCA) to understand WHY risks exist, not just what they are. The recommended approach is the '5 Whys' method or fishbone (Ishikawa) diagram.\n\nExample — Battery Disposal Risk:\nWhy are batteries disposed of improperly? → Customers don't know the hazards.\nWhy don't they know? → No disposal instructions provided at point of sale.\nWhy not? → No policy requiring it.\nWhy no policy? → No one assigned responsibility.\nRoot cause: Absence of waste management responsibility assignment.\n\nThis leads to a targeted corrective action rather than a symptom-level response. Source: ROGEAP ESMS Guidelines, pp.31-32."
      },
      {
        heading: "IFC Risk Assessment Requirements",
        body: "IFC Performance Standard 1 (Assessment and Management of Environmental and Social Risks and Impacts) requires that companies: (1) identify all relevant E&S risks and impacts, both direct and supply chain; (2) assess the significance of each risk using probability and severity; (3) develop management measures proportionate to the risk level; (4) monitor and review risk status periodically.\n\nThe IFC ESMS Toolkit (Element 2) provides a structured process: identify aspects → assess impacts → prioritise aspects → develop objectives and targets. The risk register is the output of this process and is the 'living document' of your ESMS, updated at minimum annually or after any significant incident or operational change."
      }
    ],
    resources: [
      { label: "IFC ESMS Toolkit Element 2 — Risk Identification", url: "https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
      { label: "IFC Performance Standard 1 — Assessment & Management", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "World Bank ESF (2017)", url: "https://thedocs.worldbank.org/en/doc/837721522762050108-0290022018/original/ESFFramework.pdf" },
      { label: "ECOWAS ESRM Guide on Off-Grid Solar", url: "https://ecowas.int/wp-content/uploads/2022/08/ROGEAP-Annex7-ESRM-Section-Guide-on-Off-Grid-Solar-for-CFI_19Dec2020-final.pdf" },
    ]
  },

  // ── COMPLIANCE ─────────────────────────────────────────────
  compliance: {
    id: "compliance",
    title: "Legal & Regulatory Compliance",
    color: "#E8A020",
    rogeapRef: "ROGEAP ESMS Guidelines §5 (pp.32-39) — Compliance",
    ifcRef: "IFC ESMS Toolkit Element 3 — Legal and Other Requirements; IFC PS1 §18",
    summary: "Compliance — the systematic adherence to all applicable legal, regulatory, tax, and contractual requirements — is a baseline ROGEAP condition. Companies must comply with national ESHS laws in all countries of operation. The ROGEAP guidelines distinguish four categories of compliance: Legal, Regulatory, Tax, and Other Commitments (voluntary standards, contracts).",
    sections: [
      {
        heading: "Categories of Compliance for OGS Companies",
        body: "ROGEAP ESMS Guidelines Section 5 (pp.32-36) identifies the following compliance categories:\n\n1. ENVIRONMENTAL LAWS: National environmental agency regulations; EIA requirements (rarely triggered by OGS but check); waste management regulations; pollution control; chemical/hazardous substances management.\n\n2. SOCIAL / LABOUR LAWS: National Labour Acts (minimum wage, working hours, overtime, non-discrimination, child labour prohibition, freedom of association, termination procedures); social security contributions; community relations laws.\n\n3. CONSUMER PROTECTION LAWS: Product safety, fair trade practices, transparent pricing, warranty obligations, consumer data privacy.\n\n4. OHS LAWS: National OHS Acts; mandatory risk assessments; PPE provision; first aid; safety committees; OHS training; accident reporting.\n\n5. BUSINESS REGISTRATION & LICENSING: Company incorporation; annual filings; operating licences; professional body registrations for technical roles.\n\n6. ENERGY SECTOR REGULATIONS: NERC/REA licensing; product standards (IEC, VeraSol); local government permits.\n\n7. TAX: Corporate income tax; VAT/GST; PAYE; withholding tax; customs duties.\n\n8. VOLUNTARY STANDARDS: IFC PS, ISO 14001/45001, GOGLA CP Code, UN Guiding Principles, Anti-Bribery and Corruption (ABC) policies."
      },
      {
        heading: "Legal Register — What to Track",
        body: "For each applicable law or regulation, the ROGEAP guidelines (pp.36-37) recommend documenting: Law/Regulation Name and Citation; Issuing Authority; Effective Date and amendments; Relevant Sections pertinent to OGS operations; Specific Requirements/Obligations; Applicability to Company Operations; Frequency of Compliance; Evidence of Compliance required; Responsible Person/Department; Review Date.\n\nThis register must be kept current. Assign a 'compliance champion' responsible for subscribing to official government gazettes, national energy/environmental agency newsletters, and industry association updates to track regulatory changes.\n\nSource: ROGEAP ESMS Guidelines, pp.36-37 (procedures for ensuring compliance)."
      },
      {
        heading: "Permits and Licences",
        body: "Beyond legal compliance, ROGEAP Section 5 (pp.38-39) requires a Permit and License Matrix tracking: permit name, issuing authority, application requirements, validity period, renewal dates, associated fees, and the responsible individual for application/renewal.\n\nFor OGS companies in West and Central Africa, key permits typically include: business operating licence (local government), electrical contractor registration (for installation activities), e-waste handler approval (NESREA or equivalent), NERC/REA licence (for relevant power activities), and import permits for solar equipment.\n\nTable 7 (Compliance Tracking Checklist) and Table 8 (Legal and Regulatory Register Template) from the ROGEAP guidelines provide ready-to-use templates."
      },
      {
        heading: "IFC Requirements on Compliance",
        body: "The IFC ESMS Toolkit (Element 3 — Legal and Other Requirements) requires that companies: (1) have a procedure to identify applicable legal requirements; (2) ensure these requirements are incorporated into their ESMS; (3) conduct periodic reviews to verify compliance; and (4) keep records of compliance status.\n\nIFC PS1 §18 states: 'The client will comply with applicable laws and regulations of the jurisdictions in which it is operating that pertain to the labor, environmental and social requirements of this Performance Standard.' Non-compliance with national law is a direct trigger for investor action, including loan covenant violations."
      }
    ],
    resources: [
      { label: "IFC ESMS Toolkit Element 3 — Legal Requirements", url: "https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
      { label: "IFC Performance Standards (2012)", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "ISO 14001 — Environmental Management Systems", url: "https://www.iso.org/standard/60857.html" },
      { label: "GOGLA Consumer Protection Code", url: "https://www.gogla.org/what-we-do/business-services-and-standards/consumer-protection-code/" },
    ]
  },

  // ── PLANS ──────────────────────────────────────────────────
  plans: {
    id: "plans",
    title: "Environmental & Social Management Plans",
    color: "#0E7C7B",
    rogeapRef: "ROGEAP ESMS Guidelines §7-12 (pp.47-89) — ESMPs",
    ifcRef: "IFC ESMS Toolkit Elements 4-6 — Objectives, Programs, Monitoring; IFC PS1-PS4",
    summary: "Environmental and Social Management Plans (ESMPs) are the operational backbone of your ESMS. They translate policy commitments and risk assessments into day-to-day management procedures, responsibilities, and monitoring. The ROGEAP guidelines require seven management plans for OGS companies: OHS Plan, Community Health & Safety Plan, Consumer Protection Plan, Waste Management Plan, Emergency Preparedness Plan, HR Plan, and Stakeholder Engagement Plan.",
    sections: [
      {
        heading: "Structure of an ESMP",
        body: "Each ESMP should include the following components (ROGEAP §7, p.47):\n• Impact Analysis: Types of potential impacts and ways to mitigate them\n• Mitigation Actions: Specific steps to reduce or offset negative impacts\n• Environmental and Social Standards: Guidelines for products and operations\n• Monitoring Plan: How performance will be tracked and what data collected\n• Roles and Responsibilities: Who is responsible for each task and activity\n• Communication Strategy: How the company will share information and handle grievances\n• Schedule and Costs: Implementation timeline and estimated budget\n• Community Engagement: How stakeholders will be involved throughout\n\nThe IFC ESMS Toolkit (Element 4) frames this as the 'programs and management' step: converting policy commitments and risk assessment findings into specific operational controls."
      },
      {
        heading: "OHS Plan — ROGEAP §8",
        body: "The OHS Plan is required under IFC PS2/WB ESS2. Key elements (ROGEAP, pp.49-56):\n1. Management commitment statement\n2. Hazard identification and risk assessment (with OGS-specific hazards: falls, electrical, battery, vehicles, remote work, GBV/SEAH)\n3. Risk control measures using hierarchy: Eliminate → Substitute → Engineer → Administer → PPE\n4. PPE requirements by task\n5. Training programme (induction, certified training for high-risk tasks, toolbox talks)\n6. Incident reporting and investigation procedure\n7. OHS targets and KPIs\n\nCritical ROGEAP requirement: Lockout/Tagout (LOTO) procedures must be in place before any electrical work. GBV/SEAH must be explicitly listed as an OHS hazard with a confidential reporting route. Source: ROGEAP §8, pp.49-56 + Table 11 (Incident Report Form) + Table 12 (OHS Plan template)."
      },
      {
        heading: "Waste Management Plan — ROGEAP §10",
        body: "The Waste Management Plan is required under IFC PS3/WB ESS3. The ROGEAP guidelines (pp.72-79) place e-waste at the centre of the plan — it is the highest-priority environmental risk for the OGS sector.\n\nKey elements: (1) Waste audit — identify types and quantities; (2) Waste management strategies applying the 5R hierarchy (Reduce → Reuse → Repair → Refurbish → Recycle); (3) Implementation of a take-back scheme with customer incentives; (4) Engagement with the informal recycling sector where prevalent; (5) Monitoring and review.\n\nCritical IFC PS3 requirement: Hazardous waste (batteries) must be disposed through licensed and regulated facilities. The company must maintain records (waste manifests, certificates of recycling) demonstrating responsible disposal. Releasing hazardous waste into the environment through informal channels — even if 'common practice' — constitutes non-compliance.\n\nSource: ROGEAP §10, pp.72-79; Table 15-16 (waste management templates)."
      },
      {
        heading: "Emergency Preparedness Plan — ROGEAP §11",
        body: "The Emergency Preparedness and Response Plan (EPRP) is required under IFC PS2/PS4. The ROGEAP guidelines (pp.80-85) describe a general emergency management process: Hazard Identification → Emergency Response Procedures → Shutdown Procedures → Equipment and Facilities → Emergency Contacts → Evacuation Plans → Training and Drills → Review and Update.\n\nFor OGS companies, the priority scenarios are: electrical fires and incidents, battery thermal runaway/acid spill, vehicle accidents, natural disasters (floods, storms), security incidents (theft, civil unrest), and GBV/SEAH incidents. All procedures must be in writing, regularly tested through drills, and updated after each drill or real incident.\n\nSource: ROGEAP §11, pp.80-85 + Table 16-17 (emergency scenarios and procedures)."
      },
      {
        heading: "Stakeholder Engagement Plan — ROGEAP §12",
        body: "The SEP is required under WB ESS10 and IFC PS1. IFC good practice (referenced in ROGEAP §12, pp.86-89) requires engagement that is: Targeted, Early, Informed, Two-way, Gender Inclusive, Localized, Documented, and Reported.\n\nThe SEP must include: (1) stakeholder identification and analysis (mapping by interest and influence); (2) engagement planning (objectives, methods, frequency, budget); (3) implementation (proactive disclosure, feedback channels, grievance mechanism); (4) monitoring and evaluation (KPIs, regular reviews).\n\nCritical requirement: Engagement must apply Free, Prior, and Informed Consent (FPIC) principles. Women and vulnerable groups must be specifically included — separate forums may be necessary in contexts where mixed-gender participation is culturally constrained. Source: ROGEAP §12, pp.86-89; Table 17 (stakeholder register template)."
      }
    ],
    resources: [
      { label: "IFC ESMS Toolkit Elements 4-6 — Programs & Monitoring", url: "https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
      { label: "IFC PS2 — Labour and Working Conditions", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "IFC PS3 — Resource Efficiency & Pollution Prevention", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "IFC PS4 — Community Health, Safety and Security", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "ILO Solar Industry OHS Guidelines", url: "https://www.ilo.org/wcmsp5/groups/public/---ed_protect/---protrav/---safework/documents/publication/wcms_655511.pdf" },
      { label: "GOGLA E-Waste Toolkit", url: "https://www.gogla.org/what-we-do/circularity/e-waste-toolkit/" },
      { label: "GOGLA Business Blueprints for E-Waste", url: "https://www.gogla.org/tools/business-blueprints-for-e-waste-management/" },
      { label: "ACE E-Waste Quick Win Report", url: "https://www.ace-taf.org/wp-content/uploads/2019/11/ACE-EWaste-Quick-Win-Report20191029-SCREEN.pdf" },
    ]
  },

  // ── TOOLS ──────────────────────────────────────────────────
  tools: {
    id: "tools",
    title: "Implementation Tools",
    color: "#0E7C7B",
    rogeapRef: "ROGEAP ESMS Guidelines — Tables 6, 11, 12, 15-22 (throughout)",
    ifcRef: "IFC ESMS Toolkit Elements 3-7 — Legal Requirements through Monitoring",
    summary: "The Implementation Tools are the operational layer of your ESMS — the checklists, registers, logs, and forms that turn written plans into daily practice. Each tool in this section is based directly on templates from the ROGEAP ESMS Guidelines and IFC ESMS Toolkit. They are pre-populated with ROGEAP baseline requirements and are fully editable to match your company's context.",
    sections: [
      {
        heading: "Why Implementation Tools Matter",
        body: "The IFC ESMS Toolkit (Element 7 — Management Review and Continual Improvement) emphasises that an ESMS only delivers value when management instruments are actually used. Without operational records — incident logs, training registers, waste tracking, grievance logs — you cannot demonstrate to investors, auditors, or regulators that your plans are being implemented.\n\nROGEAP reviewers and DFI investors specifically request: signed Codes of Conduct, training registers, incident reports, waste disposal certificates, and grievance logs as evidence of ESMS implementation. Absence of records is treated as absence of implementation."
      },
      {
        heading: "ROGEAP Screening Questionnaire (Tool 1)",
        body: "Directly reproduced from ROGEAP Table 6. Use it as a self-assessment to identify ESMS gaps, prepare for investor due diligence, and determine what must be committed to in your ESAP. The questionnaire covers five domains: Exclusion Criteria, ESMS/Policies, OHS, E-Waste, and Stakeholder Engagement/GRM."
      },
      {
        heading: "Risk Register & Matrix (Tool 2)",
        body: "Implements the ROGEAP probability × severity risk rating methodology (described in Section 4, pp.22-23 of the Guidelines). Pre-populated with 15 baseline OGS risks from Table 5 (ROGEAP pp.23-26), covering: e-waste, OHS, gender/SEAH, labour, consumer protection, community safety, and supply chain risks. Add company-specific risks and assign mitigation measures and responsible persons."
      },
      {
        heading: "Incident & Near-Miss Log (Tool 5)",
        body: "Based on ROGEAP Table 11 (Sample Incident/Accident Report Form, p.52). All accidents, injuries, near-misses, and dangerous occurrences must be logged within 24 hours. Serious injuries and fatalities must be reported to the national labour/OHS authority within 48 hours (specific timelines vary by country). Root cause analysis must be completed for all incidents within 5 working days.\n\nThe IFC ESMS Toolkit requires that incident data be reviewed for trends and used to continuously improve the OHS Plan."
      },
      {
        heading: "Waste Tracking Register (Tool 8)",
        body: "Based on ROGEAP Table 15 (Waste Disposal Management Template, p.73). Records waste type, quantity, source, 5R action applied, disposal route, recycler/partner, and certificate number. Certificates of Recycling from licensed recyclers are the primary evidence of IFC PS3 compliance for hazardous waste. Retain all certificates for minimum 5 years.\n\nTrack separately: lead-acid batteries (classified hazardous under Basel Convention), lithium batteries, solar panels, and accessories. The ROGEAP guidelines (p.72) cite proper waste tracking as essential for demonstrating Extended Producer Responsibility (EPR) compliance."
      },
      {
        heading: "Grievance Log (Tool 10)",
        body: "Based on ROGEAP Table 20 and 21 (GRM log format, pp.92-94). Records all complaints — from employees, customers, and communities — using the five-stage ROGEAP GRM process: Identification (Day 1) → Assessment and Logging (Days 1-3) → Acknowledgement (within 3 days) → Response Development (Days 4-8) → Implementation and Communication (Days 5-15).\n\nLevel classification: Level 1 (one-off event) → standard process; Level 2 (widespread or repeated) → escalation to management; Level 3 (breach of law or policy) → immediate senior management involvement and potential regulatory notification.\n\nFor GBV/SEAH complaints: maintain a separate confidential log. Only record nature of complaint and processing outcome — never victim personal details — in the general log. Source: ROGEAP §13, pp.90-94."
      },
      {
        heading: "Supplier E&S Assessment (Tool 11)",
        body: "IFC PS2 §27-29 requires supply chain due diligence, particularly regarding child labour, forced labour, and worker health and safety in primary supply chains. For OGS companies, the primary supply chain risk is solar panel manufacturing — the manufacturing supply chain for solar panels has documented instances of forced labour (particularly in polysilicon production) and child labour risks in battery material mining.\n\nThe Supplier Assessment tool helps you: identify high-risk suppliers by category and country; assess their E&S policies; and require contractual E&S standards as a condition of supply. Companies with DFI financing are increasingly required to demonstrate supply chain due diligence as a condition of continued financing."
      },
      {
        heading: "ROGEAP Monitoring Form (Tool 12)",
        body: "Directly reproduced from ROGEAP Table 22 (Environmental and Social Risk Monitoring Form for Solar Companies). This form is used for quarterly monitoring reports submitted under ROGEAP grant/loan agreements. It covers: ESMS general status, policies and processes, capacity and training, monitoring activities, reporting, and grievance mechanism implementation.\n\nComplete this form at minimum quarterly and retain copies as evidence of ongoing ESMS implementation. The IFC ESMS Toolkit (Element 7) describes management review as the mechanism for 'closing the loop' — using monitoring data to improve the ESMS over time."
      }
    ],
    resources: [
      { label: "IFC ESMS Toolkit — General (2015)", url: "https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
      { label: "IFC ESMS Implementation Handbook — General", url: "https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
      { label: "ROGEAP Operational Manual (GRM)", url: "https://ecowas.rogeap.org/wp-content/uploads/2023/10/GRM-Operational-Manual-ROGEAP-ECOWAS.pdf" },
      { label: "CAO Grievance Resource — Design Tools", url: "https://www.cao-ombudsman.org/accessing-cao/making-a-complaint/grievance-mechanism-resources" },
      { label: "CAMO Clean Energy ESMS Toolkit", url: "https://repp.energy/wp-content/uploads/2020/10/Environmental-and-Social-Management-System-Toolkit.pdf" },
    ]
  },

  // ── ESAP ───────────────────────────────────────────────────
  esap: {
    id: "esap",
    title: "Environmental & Social Action Plan (ESAP)",
    color: "#1A3A5C",
    rogeapRef: "ROGEAP ESMS Guidelines §15 (pp.98-101) — ESAP; Table 23-24",
    ifcRef: "IFC ESMS Toolkit Element 4 — Objectives, Targets and Programs",
    summary: "The ESAP is a time-bound, accountable roadmap that commits your company to developing or improving specific ESMS components by specific dates. It is required by ROGEAP for: (1) all companies that do not yet have all ESMS components in place, and (2) all companies classified as medium/high E&S risk (Category B2). The ESAP is included in the legal grant/loan agreement with ROGEAP.",
    sections: [
      {
        heading: "What an ESAP Is and When It Is Required",
        body: "An Environmental and Social Action Plan (ESAP) consists of measures an organisation implements or plans to implement to address E&S risks and impacts associated with their products, services, and operations. It functions as a roadmap to ensure compliance with E&S safeguard requirements.\n\nROGEAP requires an ESAP for:\n1. Companies that do not yet have all required ESMS components in place — the ESAP commits to developing missing components within one year\n2. Companies classified as Category B2 (Medium Risk) due to size, OHS history, GBV incidents, or unfair working conditions\n\nThe ESAP is embedded in the financing agreement and its implementation is monitored through quarterly E&S reports. Non-implementation of ESAP commitments is a covenant violation that can trigger loan recall or grant suspension.\n\nSource: ROGEAP ESMS Guidelines §15, pp.98-101."
      },
      {
        heading: "ESAP Structure — Required Elements",
        body: "Each ESAP action must include the following elements (ROGEAP Table 23 format, p.99):\n\n• Action Required: Specific, measurable action to be taken\n• Deliverable/Output: The tangible output that will evidence completion\n• Key Performance Indicator (KPI): How success is measured\n• Baseline Status: Current situation (what exists now)\n• Target: The desired end state\n• Timeline/Deadline: Specific date by which the action will be complete\n• Responsible Person/Role: Named individual accountable for delivery\n• Budget (USD): Estimated cost of implementing the action\n\nESAP actions are organised by ESMS category: E&S Assessment and Management System; Labour and Working Conditions; OHS; E-Waste Management; End User Health and Safety; Stakeholder Engagement and GRM; Other Issues."
      },
      {
        heading: "ESAP Example — ROGEAP Sample (Table 24)",
        body: "The ROGEAP guidelines (Table 24, pp.99-101) provide a sample ESAP for an OGS company developing its ESMS from scratch. Key actions and indicative budgets include:\n\n• Company E&S Policy: $500 — Draft, review, and approve policy (Feb-Mar 2025)\n• E&S Risk Assessment: $1,000 — Hired consultant assesses and reports on E&S risks (Feb 2025)\n• E&S Management Plan: $1,000 — Consultant drafts ESMP; management reviews and approves (Mar 2025)\n• Organisational Capacity: $1,000 — Assess E&S awareness; train all staff; recruit E&S specialist (Apr–Jun 2025)\n• Emergency Preparedness Plan: $500 — Draft and approve EPRP; train all staff (Mar–Jun 2025)\n• SEP and GRM: $500 each — Develop, approve, and operationalise (Mar–Apr 2025)\n• Monitoring Plan: $500 — Develop and implement E&S M&E plan (Mar–Apr 2025)\n\nTotal indicative budget for a basic ESMS from scratch: approximately $5,000–$8,000 USD."
      },
      {
        heading: "Developing a Credible ESAP",
        body: "The IFC ESMS Toolkit (Element 4 — Objectives, Targets and Programs) advises that ESAP objectives and targets should be SMART: Specific, Measurable, Achievable, Relevant, and Time-bound. Vague actions such as 'improve waste management' are not acceptable — the action must specify what will be done, by whom, and by when.\n\nCommon ESAP failures to avoid:\n• No named responsible person (department names are not sufficient)\n• No specific deadline (quarterly or annual is not specific enough)\n• Targets that cannot be verified (no measurable KPI)\n• Budgets not allocated (no budget = no credible commitment)\n• Actions too ambitious for the timeline (signals non-delivery)\n\nBest practice: Review ESAP progress monthly at management level; report status quarterly in the ROGEAP E&S Monitoring Form; escalate delayed or blocked actions to the Board for decision."
      },
      {
        heading: "ESAP Categories (ROGEAP Table 23 Format)",
        body: "Organise your ESAP actions under the following ROGEAP categories to ensure comprehensive coverage:\n\n1. Environmental and Social Assessment and Management System (overall ESMS)\n2. Labour and Working Conditions (HR policy, contracts, wages, Code of Conduct)\n3. Occupational Health and Safety (OHS plan, PPE, incident reporting, training)\n4. E-Waste Management (take-back scheme, recycler partnerships, customer education)\n5. End User / Consumer Health and Safety (product safety, consumer protection)\n6. Stakeholder Engagement and GRM (SEP, grievance mechanism, SEA/SH process)\n7. Land-Related Issues (if relevant — written consent from landowners for ground installations)\n8. Other Issues (gender, supply chain, water resources as applicable)\n\nSource: ROGEAP ESMS Guidelines §15, p.99; ECOWAS ESRM Sector Guide."
      }
    ],
    resources: [
      { label: "IFC ESMS Toolkit Element 4 — Objectives, Targets & Programs", url: "https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
      { label: "Green Climate Fund ESAP Template", url: "https://www.greenclimate.fund/document/environmental-and-social-action-plan-template-annex-12-simplified-approval-process-funding" },
      { label: "ECOWAS ESRM Guide on Off-Grid Solar", url: "https://ecowas.int/wp-content/uploads/2022/08/ROGEAP-Annex7-ESRM-Section-Guide-on-Off-Grid-Solar-for-CFI_19Dec2020-final.pdf" },
      { label: "IFC Performance Standards (2012)", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "Equator Principles (2020)", url: "https://equator-principles.com/wp-content/uploads/2020/05/The-Equator-Principles-July-2020-v2.pdf" },
    ]
  },

  // ── TOOL-SPECIFIC GUIDELINES ───────────────────────────────
  tool_risk_matrix: {
    id: "tool_risk_matrix", title: "Risk Register & Matrix — Guidance",
    color: "#C0392B", rogeapRef: "ROGEAP §4 pp.22-23", ifcRef: "IFC PS1; IFC ESMS Toolkit Element 2",
    summary: "The risk register is the core analytical document of your ESMS. It lists every significant E&S risk, scores it by probability and severity, and records the controls in place and planned. It must be kept current — reviewed annually and after every significant incident or operational change.",
    sections: [
      { heading: "Probability × Severity Rating Scale", body: "1 = Low: Unlikely to occur; minimal impact if it does\n2 = Medium: May occur occasionally; moderate impact\n3 = High: Likely to occur; significant impact\n4 = Extreme: Almost certain; catastrophic impact\n\nRisk Rating = Probability × Severity:\n• CRITICAL (9-16): Immediate action required — do not proceed without controls in place\n• HIGH (6-8): Priority within 30 days — named responsible person and deadline required\n• MEDIUM (3-5): Manage within agreed timeframe; monitor\n• LOW (1-2): Monitor; annual review sufficient" },
      { heading: "Hierarchy of Controls", body: "When developing mitigation measures, always apply controls in this order:\n1. ELIMINATION — Remove the hazard entirely (e.g., choose battery chemistry with lower thermal runaway risk)\n2. SUBSTITUTION — Replace with something safer (e.g., pre-assembled wiring to reduce electrical work at heights)\n3. ENGINEERING CONTROLS — Physical barriers and safeguards (e.g., guardrails on rooftops, LOTO equipment)\n4. ADMINISTRATIVE CONTROLS — Procedures, training, supervision (e.g., buddy system, LOTO procedures, GBV reporting channel)\n5. PPE — Last resort; protects worker but does not eliminate the hazard\n\nPPE is always the last layer — never the primary control. Source: IFC PS2; ISO 45001." },
    ],
    resources: [
      { label: "IFC ESMS Toolkit Element 2 — Identification of Aspects and Impacts", url: "https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
      { label: "IFC PS1 — Assessment and Management of E&S Risks", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
    ]
  },

  tool_grievance_log: {
    id: "tool_grievance_log", title: "Grievance Log — Guidance",
    color: "#6C3483", rogeapRef: "ROGEAP §13 pp.90-94; Tables 19-21", ifcRef: "IFC PS1; WB ESS10",
    summary: "The Grievance Mechanism log records all complaints from workers, customers, and communities. The ROGEAP guidelines specify a 5-stage process with defined response timelines. GBV/SEAH complaints require a separate confidential process.",
    sections: [
      { heading: "5-Stage ROGEAP GRM Process", body: "STAGE 1 — IDENTIFICATION (Day 1): Complaint received via any channel (phone, email, in-person, suggestion box). Logged immediately.\n\nSTAGE 2 — ASSESSMENT & LOGGING (Days 1-3): Significance assessed. Assigned a Level: Level 1 (one-off event), Level 2 (widespread/repeated), Level 3 (breach of law/policy). Recorded in GRM log. Complainant acknowledged.\n\nSTAGE 3 — ACKNOWLEDGEMENT (within 3 days): Formal acknowledgement sent to complainant via appropriate channel.\n\nSTAGE 4 — RESPONSE DEVELOPMENT & IMPLEMENTATION (Days 4-15): Assigned to appropriate person for resolution. Response developed with management input. Redress action implemented. Outcome communicated to complainant.\n\nSTAGE 5 — MONITORING: Outcomes tracked. Grievance data reviewed for trends. Mechanism updated based on lessons learned.\n\nSource: ROGEAP Table 18 (p.92) and Table 20-21 (GRM log format, pp.93-94)." },
      { heading: "GBV/SEAH Complaints — Special Protocol", body: "GBV/SEAH complaints must follow a separate, confidential process (ROGEAP §13, pp.91-92):\n\n• ETHICAL: All actions must respect the dignity, rights, and autonomy of the survivor\n• CONFIDENTIAL: Information shared only on a need-to-know basis\n• NON-BIASED: Impartial investigators trained to recognise their own biases\n• RAPID: Response within 72 hours; clear timelines communicated to survivor\n• SURVIVOR-CENTRED: Survivor's needs and well-being at the centre; offer counselling, medical care, legal assistance\n\nIn the general GRM log: record only the NATURE of complaint and PROCESSING OUTCOME. Never record victim personal details in the general log. Maintain a separate, password-protected record for GBV/SEAH cases.\n\nSource: ROGEAP §13, pp.91-92; ROGEAP Operational Manual." },
    ],
    resources: [
      { label: "ROGEAP Operational Manual — GRM Procedures", url: "https://ecowas.rogeap.org/wp-content/uploads/2023/10/GRM-Operational-Manual-ROGEAP-ECOWAS.pdf" },
      { label: "CAO Grievance Design Resource", url: "https://www.cao-ombudsman.org/accessing-cao/making-a-complaint/grievance-mechanism-resources" },
      { label: "WB ESS10 — Stakeholder Engagement", url: "https://www.worldbank.org/en/projects-operations/environmental-and-social-framework" },
    ]
  },

  tool_waste_register: {
    id: "tool_waste_register", title: "Waste Tracking Register — Guidance",
    color: "#2D8A4E", rogeapRef: "ROGEAP §10 pp.72-79; Tables 15-16", ifcRef: "IFC PS3",
    summary: "The Waste Tracking Register is the evidentiary record of your waste management performance. Certificates of Recycling from licensed recyclers are the primary evidence of IFC PS3 compliance. All hazardous waste (batteries) must be traceable from generation to final disposal.",
    sections: [
      { heading: "Hazardous Waste Classification", body: "Lead-acid batteries: Classified as hazardous waste under the Basel Convention and most national frameworks. Must be handled, stored, transported, and disposed of only through licensed facilities. Open dumping is illegal and constitutes an IFC PS3 violation.\n\nLithium-ion batteries: Classified as dangerous goods for transport (UN3480/UN3481). Fire risk during transport requires specific packaging. Must be recycled by specialist facilities.\n\nSolar panels: Generally not classified as hazardous (though panels containing cadmium telluride are an exception). Most can be recycled as electronic waste.\n\nSource: Basel Convention; ROGEAP §10, pp.72-79." },
      { heading: "5R Hierarchy Applied to OGS Waste", body: "The ROGEAP guidelines (p.72, Figure 14) specify the waste management hierarchy:\n\n1. REDUCE: Extend product life through maintenance; choose durable components; reduce packaging\n2. REUSE: Refurbish returned systems for secondary market; reuse salvageable panels in less demanding applications\n3. REPAIR: Offer repair and maintenance services; stock spare parts for all models in current and recent range\n4. REFURBISH: Recondition salvageable batteries; extract usable cells for smaller applications\n5. RECYCLE: Partner with certified recyclers — last resort after all other options exhausted\n\nDisposal (landfill, incineration) should only occur for genuinely unrecoverable materials and must be through licensed facilities with documentation." },
    ],
    resources: [
      { label: "GOGLA E-Waste Toolkit", url: "https://www.gogla.org/what-we-do/circularity/e-waste-toolkit/" },
      { label: "GOGLA Business Blueprints for E-Waste Management", url: "https://www.gogla.org/tools/business-blueprints-for-e-waste-management/" },
      { label: "IFC PS3 — Resource Efficiency & Pollution Prevention", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "ACE E-Waste Quick Win Report (West Africa)", url: "https://www.ace-taf.org/wp-content/uploads/2019/11/ACE-EWaste-Quick-Win-Report20191029-SCREEN.pdf" },
    ]
  },

  tool_monitoring_form: {
    id: "tool_monitoring_form", title: "ROGEAP Monitoring Form — Guidance",
    color: "#0E7C7B", rogeapRef: "ROGEAP §14 pp.95-97; Table 22", ifcRef: "IFC ESMS Toolkit Element 7",
    summary: "The E&S Monitoring Form (ROGEAP Table 22) is the quarterly reporting instrument for ROGEAP grant/loan holders. It verifies that the ESMS is being implemented as committed in the ESAP and financing agreement. Completed forms are submitted to the Partner Financial Manager (PFM) as part of standard E&S monitoring.",
    sections: [
      { heading: "Monitoring and Review Process", body: "The ROGEAP monitoring approach follows the Plan-Do-Check-Act (PDCA) framework:\n\nPLAN: Define monitoring objectives and KPIs aligned with ESMS commitments\nDO: Collect data through inspections, audits, incident records, training registers, grievance logs\nCHECK: Analyse data against KPIs; identify gaps and corrective actions\nACT: Implement corrective actions; update plans; report to management and investors\n\nThe IFC ESMS Toolkit (Element 7) describes management review as the key mechanism for 'closing the loop' — performance data must be reviewed by management and used to make decisions, not just filed. Source: ROGEAP §14, pp.95-97." },
      { heading: "Key Performance Indicators", body: "The ROGEAP monitoring process tracks both PROCESS indicators (activities completed) and PERFORMANCE indicators (outcomes achieved).\n\nProcess indicators: Number of training sessions delivered; Number of OHS inspections conducted; Number of grievances received and resolved; E-waste collected (kg/units).\n\nPerformance indicators: Lost-time injury rate; Customer satisfaction score; Percentage of ESAP actions completed on schedule; Volume of hazardous waste to licensed recycler vs. total waste.\n\nBoth types of indicator are needed — process indicators confirm activity; performance indicators confirm results." },
    ],
    resources: [
      { label: "IFC ESMS Toolkit Element 7 — Management Review", url: "https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
      { label: "UNDP Results-Based Management Handbook", url: "https://procurement-notices.undp.org/view_file.cfm?doc_id=96008" },
    ]
  },

  tool_coc: {
    id: "tool_coc", title: "Code of Conduct — Guidance",
    color: "#2A5F9E", rogeapRef: "ROGEAP §9 pp.66-68; Box 2", ifcRef: "IFC PS2 §35-38",
    summary: "The Code of Conduct is a required element of the HR Policy under ROGEAP Component 5. All employees and subcontractors must read, understand, and sign the Code before starting work. The ROGEAP guidelines provide a sample Code (Box 2) specifically designed for the OGS sector, including explicit GBV/SEAH prohibitions.",
    sections: [
      { heading: "Why a Code of Conduct Is Mandatory", body: "The ROGEAP guidelines require a Code of Conduct as a distinct document because policy statements alone are insufficient to govern individual conduct. The Code must be personalised — each worker must sign it individually, in a language they understand — creating personal accountability.\n\nIFC PS2 §35-38 (on community and worker interactions) requires that companies 'promote and enforce' codes of conduct among all personnel and contractors working in communities. This is particularly critical for OGS installation teams who work inside customers' homes and remote communities." },
      { heading: "GBV/SEAH Provisions — Non-Negotiable", body: "The ROGEAP Box 2 Code of Conduct (pp.66-68) requires explicit prohibition of:\n• Sexual Harassment (unwelcome sexual advances, requests for sexual favours, verbal/physical conduct of a sexual nature)\n• Sexual Exploitation (abuse of position of vulnerability or power for sexual purposes)\n• Sexual Abuse (actual or threatened physical intrusion of a sexual nature)\n• Sexual activity with persons under 18 under any circumstances\n\nThese prohibitions must be stated in plain language, not legalese, so that every worker understands them. Violations must carry specific, stated consequences including termination and potential referral to law enforcement. The ROGEAP guidelines state that the Code 'specifies behaviour we expect of all our employees and subcontractors' — this includes temporary staff and agents, not just permanent employees." },
    ],
    resources: [
      { label: "IFC PS2 — Labour and Working Conditions", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "Global Living Wage Coalition", url: "https://www.living-wage.org/" },
    ]
  },

  tool_supplier_assessment: {
    id: "tool_supplier_assessment", title: "Supplier E&S Assessment — Guidance",
    color: "#E8730A", rogeapRef: "ROGEAP §4 p.24 (Supply Chain Risks)", ifcRef: "IFC PS2 §27-29",
    summary: "Supply chain due diligence is required under IFC PS2. For OGS companies, the primary supply chain risks are child labour in battery material mining (cobalt, lithium), forced labour in solar panel manufacturing, and e-waste impacts at the end of the product lifecycle.",
    sections: [
      { heading: "Supply Chain Risk in OGS", body: "The ROGEAP guidelines (Table 5, pp.23-26) identify supply chain sustainability as a risk category for OGS companies, with Low probability but potentially High impact for reputation and investor relations. The IFC PS2 §27 states that where companies have a 'direct contractual relationship' with primary suppliers and there is a risk of child or forced labour, companies must periodically monitor supplier compliance.\n\nKey OGS supply chain risks:\n• COBALT MINING (lithium battery supply chain): Child labour and artisanal mining risks in DRC and other sourcing countries\n• POLYSILICON PRODUCTION (solar panels): Reported forced labour in Xinjiang, China — subject to import restrictions in multiple markets\n• LEAD (battery supply chain): Environmental and health impacts of lead smelting\n\nAsk suppliers for: RBA (Responsible Business Alliance) membership; ILO Core Convention compliance; conflict minerals disclosure (OECD Due Diligence Guidance)." },
    ],
    resources: [
      { label: "IFC PS2 — Labour and Working Conditions (Supply Chain)", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "OECD Due Diligence Guidance for Responsible Supply Chains", url: "https://www.oecd.org/investment/due-diligence-guidance-for-responsible-supply-chains.htm" },
      { label: "Responsible Business Alliance (RBA)", url: "https://www.responsiblebusiness.org/" },
    ]
  },

};

// ═══════════════════════════════════════════════════════════
//  GUIDELINES PANEL COMPONENT
// ═══════════════════════════════════════════════════════════
function GuidelinesPanel({ guideId, onClose }) {
  const { t, lang } = useLang();
  const guide = GUIDELINES_DB[guideId];
  const guidelinesPdfUrl = lang === "fr" ? "/ROGEAP_ESMS-Guidelines_FR.pdf" : "/ROGEAP_ESMS-Guidelines_EN.pdf";
  const guidelinesPdfLabel = lang === "fr"
    ? "Lignes directrices SGSE ROGEAP — Secteur solaire hors réseau (PDF)"
    : lang === "pt"
    ? "Diretrizes SGAS ROGEAP — Setor Solar Fora da Rede (PDF — EN)"
    : "ROGEAP ESMS Guidelines — Off-Grid Solar Sector (PDF)";
  const [activeSection, setActiveSection] = useState(0);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Escape key to close + focus trap
  useEffect(()=>{
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0]; const last = focusable[focusable.length-1];
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
        else { if (document.activeElement === last) { e.preventDefault(); first?.focus(); } }
      }
    };
    document.addEventListener("keydown", handler);
    // Auto-focus close button on open
    setTimeout(()=>closeBtnRef.current?.focus(), 50);
    return ()=>document.removeEventListener("keydown", handler);
  },[onClose]);

  if (!guide) return null;
  const col = guide.color || C.navy;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={guide.title}
      style={{
        position:"fixed", inset:0, zIndex:2000,
        display:"flex", alignItems:"stretch",
        background:"rgba(10,20,35,0.6)",
        backdropFilter:"blur(3px)",
      }}
      onClick={e => { if(e.target === e.currentTarget) onClose(); }}>
      {/* PANEL */}
      <div ref={panelRef} className="guidelines-panel" style={{
        marginLeft:"auto",
        width:"min(680px, 100vw)",
        background:"white",
        display:"flex", flexDirection:"column",
        boxShadow:"-8px 0 40px rgba(0,0,0,0.25)",
        animation:"slideInRight 0.25s ease",
        maxHeight:"100dvh", overflowY:"hidden",
      }}>
        {/* HEADER */}
        <div style={{
          background:`linear-gradient(135deg, ${col}, ${col}CC)`,
          padding:"20px 20px 16px",
          flexShrink:0,
          position:"relative",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.65)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>📖 {t("guideBgLabel")}</div>
              <h2 style={{ margin:0, color:"white", fontFamily:F.d, fontSize:20, lineHeight:1.3 }}>{guide.title}</h2>
            </div>
            <button ref={closeBtnRef} onClick={onClose} aria-label="Close guidelines panel" style={{
              background:"rgba(255,255,255,0.2)", border:"2px solid rgba(255,255,255,0.35)", color:"white",
              width:44, height:44, borderRadius:"50%", cursor:"pointer",
              fontSize:22, display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, lineHeight:1,
            }}>×</button>
          </div>
          {/* Source badges */}
          <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
            {guide.rogeapRef && (
              <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:6, padding:"4px 10px", fontSize:11, color:"rgba(255,255,255,0.9)" }}>
                📄 {guide.rogeapRef}
              </div>
            )}
            {guide.ifcRef && (
              <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:6, padding:"4px 10px", fontSize:11, color:"rgba(255,255,255,0.9)" }}>
                📋 {guide.ifcRef}
              </div>
            )}
          </div>
        </div>

        {/* SUMMARY */}
        <div style={{ padding:"16px 24px 14px", borderBottom:`1px solid ${C.border}`, background:"#FAFBFC", flexShrink:0 }}>
          <p style={{ margin:0, fontSize:13.5, lineHeight:1.7, color:C.text }}>{guide.summary}</p>
        </div>

        {/* SECTION TABS */}
        {guide.sections?.length > 0 && (
          <div style={{
            display:"flex", gap:0, overflowX:"auto", borderBottom:`2px solid ${C.border}`,
            flexShrink:0, background:"white",
          }}>
            {guide.sections.map((sec, i) => (
              <button key={i} onClick={() => setActiveSection(i)} style={{
                padding:"10px 16px", border:"none",
                borderBottom: activeSection===i ? `3px solid ${col}` : "3px solid transparent",
                background: activeSection===i ? `${col}12` : "transparent",
                color: activeSection===i ? col : C.muted,
                fontWeight: activeSection===i ? 700 : 400,
                fontSize:12, cursor:"pointer", fontFamily:F.b,
                whiteSpace:"nowrap", flexShrink:0,
              }}>
                {sec.heading.length > 28 ? sec.heading.substring(0,25)+"…" : sec.heading}
              </button>
            ))}
          </div>
        )}

        {/* SECTION BODY */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
          {guide.sections?.length > 0 && (
            <div>
              <h3 style={{ margin:"0 0 12px", color:col, fontFamily:F.d, fontSize:17 }}>
                {guide.sections[activeSection].heading}
              </h3>
              <div style={{
                fontSize:13.5, lineHeight:1.8, color:C.text,
                whiteSpace:"pre-line",
              }}>
                {guide.sections[activeSection].body}
              </div>
            </div>
          )}

          {/* RESOURCES */}
          {guide.resources?.length > 0 && (
            <div style={{
              marginTop:28, padding:"16px 18px",
              background:`${col}09`, border:`1.5px solid ${col}30`,
              borderRadius:10,
            }}>
              <div style={{ fontWeight:700, color:col, fontSize:13, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                {t("guideResourcesLabel")}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {guide.resources.map((r, i) => {
                  const href = r.url === "__ROGEAP_GUIDELINES_PDF__" ? guidelinesPdfUrl : r.url;
                  const label = r.label === "__ROGEAP_GUIDELINES_LABEL__" ? guidelinesPdfLabel : r.label;
                  return (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{
                    color:col, fontSize:13, textDecoration:"none",
                    display:"flex", alignItems:"flex-start", gap:7, lineHeight:1.5,
                    padding:"5px 8px", borderRadius:6,
                    transition:"background 0.1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background=`${col}12`}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <span style={{ flexShrink:0, marginTop:1 }}>📄</span>
                    <span style={{ textDecoration:"underline", textUnderlineOffset:2 }}>{label}</span>
                  </a>
                  );
                })}
              </div>
              {/* Core docs always shown */}
              <div style={{ marginTop:12, paddingTop:10, borderTop:`1px solid ${col}20` }}>
                <div style={{ fontSize:11, color:C.muted, fontWeight:600, marginBottom:6 }}>{t("guideCoreDocsLabel")}</div>
                {[
                  { label:guidelinesPdfLabel, url:guidelinesPdfUrl },
                  { label:"IFC ESMS Implementation Handbook — General (2015)", url:"https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
                  { label:"IFC Performance Standards on Environmental and Social Sustainability (2012)", url:"https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
                  { label:"World Bank Environmental and Social Framework (2017)", url:"https://thedocs.worldbank.org/en/doc/837721522762050108-0290022018/original/ESFFramework.pdf" },
                  { label:"GOGLA ESMS Guidelines for Off-Grid Solar Companies", url:"https://www.gogla.org/wp-content/uploads/2020/02/ESMS-Guidelines-for-Off-Grid-Solar-Companies.pdf" },
                  { label:"FIRST for Sustainability — Managing E&S Risks", url:"https://firstforsustainability.org/managing-environmental-and-social-risk" },
                ].map((r,i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{
                    color:C.navyLight, fontSize:12, textDecoration:"none",
                    display:"flex", alignItems:"flex-start", gap:6, lineHeight:1.5, marginBottom:4,
                    padding:"3px 6px", borderRadius:5,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background="#EBF5FB"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <span style={{ flexShrink:0 }}>{r.url.startsWith("/") ? "📄" : "↗"}</span>
                    <span style={{ textDecoration:"underline", textUnderlineOffset:2 }}>{r.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{
          padding:"12px 24px", borderTop:`1px solid ${C.border}`,
          background:"#FAFBFC", flexShrink:0,
          display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8,
        }}>
          <div style={{ fontSize:11, color:C.muted }}>
            {t("guideFooter")}
          </div>
          <button onClick={onClose} style={{ ...S.btn, padding:"7px 18px", fontSize:12, background:col }}>
            {t("guideClose")}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  GUIDE BUTTON — drop-in button for any section header
// ═══════════════════════════════════════════════════════════
function GuideBtn({ guideId, onOpen }) {
  const { t } = useLang();
  return (
    <button onClick={() => onOpen(guideId)} style={{
      background:"linear-gradient(135deg,#EBF5FB,#D6EAF8)",
      border:"1.5px solid #2A5F9E",
      borderRadius:7, padding:"7px 14px",
      cursor:"pointer", fontSize:12, fontWeight:700,
      fontFamily:F.b, color:"#1A3A5C",
      display:"flex", alignItems:"center", gap:6,
      transition:"all 0.15s", flexShrink:0,
    }}
    onMouseEnter={e => { e.currentTarget.style.background="linear-gradient(135deg,#D6EAF8,#C3D8F5)"; }}
    onMouseLeave={e => { e.currentTarget.style.background="linear-gradient(135deg,#EBF5FB,#D6EAF8)"; }}>
      {t("guideBtn")}
    </button>
  );
}




// ═══════════════════════════════════════════════════════════
//  EXPORT ENGINE v2 — works in sandboxed artifact iframes
//  Strategy: All exports use window.open() + data URIs or
//  printable HTML. No external CDN libraries required.
// ═══════════════════════════════════════════════════════════

// ── Safe text for export ──
const safe = (v) => {
  if (v == null) return '';
  if (typeof v === 'object') {
    if (Array.isArray(v.sel)) {
      const items = [...(v.sel||[]), ...(v.custom||[]).filter(c=>c.checked).map(c=>c.text||c)];
      return items.join('\n• ');
    }
    return JSON.stringify(v);
  }
  return String(v);
};

// ── Escape HTML ──
const esc = (s) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// ══════════════════════════════════════════════════
//  CSV — data URI, opens in new tab (user saves)
// ══════════════════════════════════════════════════
function tableToCSV(columns, rows) {
  const hdr = columns.map(c=>`"${c.label}"`).join(',');
  const body = (rows||[]).map(row=>
    columns.map(c=>`"${(row[c.id]||'').toString().replace(/"/g,'""')}"`).join(',')
  );
  return [hdr,...body].join('\r\n');
}

function exportCSV(filename, columns, rows) {
  const csv = '\uFEFF' + tableToCSV(columns, rows);
  // Open in new tab as data URI — works in sandboxed iframes
  // User will see the CSV content and can save it (File > Save or Ctrl+S)
  const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  try {
    const a = document.createElement('a');
    a.href = uri;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); }, 100);
  } catch(e) {
    // Fallback: open in new tab
    const w = window.open();
    if (w) {
      w.document.write('<pre>' + esc(csv) + '</pre>');
      w.document.title = filename;
    }
  }
}

// ══════════════════════════════════════════════════
//  PDF — printable HTML in new window
//  User presses Ctrl+P / Cmd+P → Save as PDF
// ══════════════════════════════════════════════════
function buildPrintHTML(title, sections, strings={}) {
  const noEntries = strings.noEntries || '(no entries recorded)';
  const notCompleted = strings.notCompleted || '(not completed)';
  const coverLine = strings.coverLine || 'Environmental & Social Management System  |  ROGEAP-aligned';
  const footerLine = strings.footerLine || 'ROGEAP ESMS Builder  |  ROGEAP-aligned  |  IFC Performance Standards';
  const generated = strings.generated || 'Generated';
  const NAVY = '#1A3A5C', TEAL = '#0E7C7B', AMBER = '#E8A020';
  const MUTED = '#5F7080', LIGHT = '#F0F4F8', RED = '#C0392B';

  let body = '';
  for (const sec of sections) {
    if (sec.type === 'heading') {
      body += `<div class="heading1">${esc(sec.text)}</div>`;
    } else if (sec.type === 'subheading') {
      body += `<div class="heading2">${esc(sec.text)}</div>`;
    } else if (sec.type === 'label_value') {
      const val = (sec.value||notCompleted);
      const lines = val.split('\n').map(l=>esc(l)).join('<br>');
      body += `<div class="field"><div class="field-label">${esc(sec.label)}</div><div class="field-value">${lines}</div></div>`;
    } else if (sec.type === 'checklist') {
      body += `<div class="field"><div class="field-label">${esc(sec.label)}</div><ul class="checklist">`;
      for (const item of (sec.items||[])) body += `<li>${esc(item)}</li>`;
      body += `</ul></div>`;
    } else if (sec.type === 'table') {
      const cols = sec.cols||[], rows = sec.rows||[];
      body += `<div class="field-label">${esc(sec.label)}</div>`;
      if (!rows.length) {
        body += `<p class="empty-note">${noEntries}</p>`;
      } else {
        body += `<div class="table-wrap"><table><thead><tr>`;
        for (const c of cols) body += `<th>${esc(c.label)}</th>`;
        body += `</tr></thead><tbody>`;
        for (const row of rows) {
          body += `<tr>`;
          for (const c of cols) body += `<td>${esc(String(row[c.id]||''))}</td>`;
          body += `</tr>`;
        }
        body += `</tbody></table></div>`;
      }
    } else if (sec.type === 'paragraph') {
      const lines = (sec.text||'').split('\n').map(l=>esc(l)).join('<br>');
      body += `<p>${lines}</p>`;
    } else if (sec.type === 'infobox') {
      body += `<div class="infobox">${esc(sec.text||'')}</div>`;
    } else if (sec.type === 'spacer') {
      body += `<div style="height:12px"></div>`;
    } else if (sec.type === 'pagebreak') {
      body += `<div class="page-break"></div>`;
    }
  }

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Trebuchet MS', Arial, sans-serif; font-size: 11pt; color: #1A2B3C;
         margin: 0; padding: 0; line-height: 1.55; background: white; }
  .cover { background: ${NAVY}; color: white; padding: 28px 32px 22px; margin-bottom: 24px; }
  .cover-super { font-size: 9pt; opacity: 0.65; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .cover-title { font-size: 18pt; font-weight: 700; font-family: 'Palatino Linotype', serif; margin: 0; }
  .cover-sub { font-size: 10pt; opacity: 0.75; margin-top: 6px; }
  .content { padding: 20px 32px 32px; }
  .heading1 { background: ${NAVY}; color: white; font-size: 13pt; font-weight: 700;
               padding: 8px 14px; margin: 24px 0 12px; border-radius: 4px; }
  .heading2 { color: ${TEAL}; font-size: 12pt; font-weight: 700; margin: 18px 0 8px;
               border-bottom: 2px solid ${TEAL}; padding-bottom: 4px; }
  .field { margin-bottom: 14px; }
  .field-label { font-size: 8.5pt; font-weight: 700; color: ${MUTED}; text-transform: uppercase;
                  letter-spacing: 0.5px; margin-bottom: 4px; }
  .field-value { font-size: 10.5pt; color: #1A2B3C; background: ${LIGHT};
                  padding: 8px 12px; border-radius: 4px; white-space: pre-wrap;
                  border-left: 3px solid ${TEAL}; }
  .checklist { margin: 4px 0 0 0; padding-left: 0; list-style: none; }
  .checklist li { padding: 3px 0 3px 22px; position: relative; font-size: 10.5pt; }
  .checklist li::before { content: "✓"; position: absolute; left: 4px; color: ${TEAL}; font-weight: 700; }
  .infobox { background: #FFF8ED; border-left: 4px solid ${AMBER}; padding: 10px 14px;
              border-radius: 4px; font-style: italic; color: ${NAVY}; font-size: 10pt;
              margin: 10px 0; }
  .table-wrap { overflow: visible; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; }
  th { background: ${NAVY}; color: white; padding: 6px 8px; text-align: left; font-size: 8.5pt;
       font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
  td { padding: 5px 8px; border-bottom: 1px solid #D0DCE8; vertical-align: top; }
  tr:nth-child(even) td { background: #F8FAFD; }
  .empty-note { color: ${MUTED}; font-style: italic; font-size: 10pt; margin: 6px 0 14px; }
  p { margin: 0 0 10px; font-size: 10.5pt; }
  .page-break { page-break-after: always; }
  footer { text-align: center; font-size: 8pt; color: ${MUTED}; margin-top: 32px;
            padding-top: 10px; border-top: 1px solid #D0DCE8; }
  @media print {
    body { font-size: 10pt; }
    .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .heading1 { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-break { page-break-after: always; }
    footer { position: fixed; bottom: 0; width: 100%; background: white; }
  }
</style>
</head><body>
<div class="cover">
  <div class="cover-super">ROGEAP Off-Grid Solar ESMS Builder</div>
  <div class="cover-title">${esc(title)}</div>
  <div class="cover-sub">${esc(coverLine)} &nbsp;|&nbsp; ${esc(generated)}: ${new Date().toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'})}</div>
</div>
<div class="content">
${body}
<footer>${esc(footerLine)}</footer>
</div>
<div style="position:fixed;top:12px;right:12px;z-index:999;display:flex;gap:8px;align-items:center;">
  <span style="font-size:12px;color:#5F7080;font-family:Arial">Use Ctrl+P / ⌘P to save as PDF</span>
  <button onclick="window.print()" style="background:#1A3A5C;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-family:Arial;font-weight:bold;font-size:13px">🖨️ Print / Save PDF</button>
</div>
<script>
  window.onload = function() {
    window.focus();
    // Small delay before auto-printing to ensure styles load
    setTimeout(function() {
      try { window.print(); } catch(e) {}
    }, 600);
  };
<\/script>
</body></html>`;
}

function exportPDF(title, sections, strings={}) {
  const html = buildPrintHTML(title, sections, strings);
  // Use Blob URL — works reliably in both standalone and embedded environments
  const blob = new Blob([html], {type:'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  try {
    a.click();
  } catch(e) {
    // Last resort: direct window.open
    try { window.open(url, '_blank'); } catch(e2) {}
  }
  setTimeout(() => {
    try { document.body.removeChild(a); } catch(e) {}
    URL.revokeObjectURL(url);
  }, 1500);
}

// ══════════════════════════════════════════════════
//  RTF — Microsoft Word-compatible format
//  Pure text, no library needed
// ══════════════════════════════════════════════════
function escRTF(s) {
  return String(s||'')
    .replace(/\\/g,'\\\\')
    .replace(/\{/g,'\\{')
    .replace(/\}/g,'\\}')
    .replace(/\n/g,'\\line ')
    .replace(/[^\x00-\x7F]/g, c => `\\u${c.charCodeAt(0)} ?`);
}

function buildRTF(title, sections) {
  const NAVY = '1A3A5C', TEAL = '0E7C7B', AMBER = 'E8A020';
  // Color table: 0=black,1=navy,2=teal,3=amber,4=white,5=muted
  let rtf = `{\\rtf1\\ansi\\ansicpg1252\\deff0
{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}{\\f1\\froman\\fcharset0 Palatino Linotype;}}
{\\colortbl;\\red26\\green58\\blue92;\\red14\\green124\\blue123;\\red232\\green160\\blue32;\\red255\\green255\\blue255;\\red95\\green112\\blue128;\\red240\\green244\\blue248;}
\\paperw12240\\paperh15840\\margl1440\\margr1440\\margt1440\\margb1440\\widowctrl\\f0\\fs22
`;

  // Cover
  rtf += `{\\pard\\f1\\fs36\\cf1\\b ${escRTF('ROGEAP Off-Grid Solar ESMS')}\\par}`;
  rtf += `{\\pard\\f1\\fs28\\cf2\\b ${escRTF(title)}\\par}`;
  rtf += `{\\pard\\fs18\\cf5 Generated: ${escRTF(new Date().toLocaleDateString('en-GB'))}\\par\\par}`;

  for (const sec of sections) {
    if (sec.type === 'heading') {
      rtf += `{\\pard\\sb240\\sa120\\f0\\fs24\\b\\cf1\\highlight6 ${escRTF(sec.text)}\\par}`;
    } else if (sec.type === 'subheading') {
      rtf += `{\\pard\\sb180\\sa80\\f0\\fs22\\b\\cf2 ${escRTF(sec.text)}\\par}`;
    } else if (sec.type === 'label_value') {
      rtf += `{\\pard\\sb100\\sa40\\fs18\\b\\cf5 ${escRTF((sec.label||'').toUpperCase())}\\par}`;
      const val = sec.value || '(not completed)';
      for (const line of val.split('\n')) {
        rtf += `{\\pard\\sa40\\fs20\\cf0 ${escRTF(line)}\\par}`;
      }
    } else if (sec.type === 'checklist') {
      rtf += `{\\pard\\sb100\\sa40\\fs18\\b\\cf5 ${escRTF((sec.label||'').toUpperCase())}\\par}`;
      for (const item of (sec.items||[])) {
        rtf += `{\\pard\\li360\\sa40\\fs20\\cf0 \\bullet  ${escRTF(item)}\\par}`;
      }
    } else if (sec.type === 'table') {
      rtf += `{\\pard\\sb100\\sa60\\fs18\\b\\cf5 ${escRTF((sec.label||'').toUpperCase())}\\par}`;
      const cols = sec.cols||[], rows = sec.rows||[];
      if (!rows.length) {
        rtf += `{\\pard\\fs18\\i\\cf5 (no entries recorded)\\par}`;
      } else {
        const cw = Math.floor(8640 / Math.max(cols.length, 1));
        // Header row
        rtf += `{\\trowd\\trgaph80`;
        let pos = 0;
        for (let i = 0; i < cols.length; i++) { pos += cw; rtf += `\\cellx${pos}`; }
        rtf += '\\row ';
        // Header cells
        rtf += '{\\trowd\\trgaph80\\trqc';
        pos = 0;
        for (let i = 0; i < cols.length; i++) { pos += cw; rtf += `\\cellx${pos}`; }
        for (const c of cols) {
          rtf += `{\\pard\\intbl\\b\\fs18\\cf1 ${escRTF(c.label)}\\cell}`;
        }
        rtf += `\\row}`;
        // Data rows
        for (const row of rows) {
          rtf += `{\\trowd\\trgaph80`;
          pos = 0;
          for (let i = 0; i < cols.length; i++) { pos += cw; rtf += `\\cellx${pos}`; }
          for (const c of cols) {
            rtf += `{\\pard\\intbl\\fs18 ${escRTF(String(row[c.id]||''))}\\cell}`;
          }
          rtf += `\\row}`;
        }
      }
      rtf += `{\\pard\\sa120\\par}`;
    } else if (sec.type === 'paragraph') {
      for (const line of (sec.text||'').split('\n')) {
        rtf += `{\\pard\\sa60\\fs20 ${escRTF(line)}\\par}`;
      }
    } else if (sec.type === 'infobox') {
      rtf += `{\\pard\\sb80\\sa80\\li360\\fs19\\i\\cf1 ${escRTF(sec.text||'')}\\par}`;
    } else if (sec.type === 'spacer') {
      rtf += `{\\pard\\sa60\\par}`;
    } else if (sec.type === 'pagebreak') {
      rtf += `{\\pard\\page\\par}`;
    }
  }

  rtf += '\n}';
  return rtf;
}

function exportWord(title, sections, _strings={}) {
  const rtf = buildRTF(title, sections);
  const fname = title.replace(/[^a-zA-Z0-9\s]/g,'').trim().replace(/\s+/g,'_') || 'ESMS_Document';
  const uri = 'data:application/rtf;charset=utf-8,' + encodeURIComponent(rtf);
  try {
    const a = document.createElement('a');
    a.href = uri;
    a.download = fname + '.rtf';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); }, 100);
  } catch(e) {
    // Fallback: open in new tab as text
    const w = window.open('', '_blank');
    if (w) {
      w.document.write('<pre style="font-family:monospace;font-size:11px;white-space:pre-wrap">' + esc(rtf.substring(0,2000)) + '...</pre><p>Copy all text and save as .rtf file</p>');
    }
  }
}

// ══════════════════════════════════════════════════
//  CSV definitions for each tabular tool
// ══════════════════════════════════════════════════
function getToolCSVDefs(t) {
  return {
    risk_matrix: { label:t("csvLabelRisk"), cols:[
      {id:"risk",label:t("riskColHazard")},{id:"category",label:t("riskColCategory")},
      {id:"applies",label:t("riskColApplies")},{id:"prob",label:t("riskColProb")},
      {id:"sev",label:t("riskColSev")},{id:"mitigation",label:t("riskColMitigation")},
      {id:"responsible",label:t("riskColResponsible")},{id:"status",label:t("riskColStatus")}
    ]},
    compliance: { label:t("csvLabelCompliance"), cols:[
      {id:"law",label:t("complianceColLaw")},{id:"authority",label:t("complianceColAuthority")},
      {id:"requirement",label:t("complianceColReq")},{id:"applies",label:t("complianceColApplies")},
      {id:"status",label:t("complianceColStatus")},{id:"expiry",label:t("complianceColExpiry")},
      {id:"responsible",label:t("complianceColResponsible")},{id:"evidence",label:t("complianceColEvidence")},
      {id:"action",label:t("complianceColAction")}
    ]},
    incident_log: { label:t("csvLabelIncident"), cols:[
      {id:"date",label:t("csvColDate")},{id:"type",label:t("csvColType")},
      {id:"description",label:t("csvColDescription")},{id:"location",label:t("csvColLocation")},
      {id:"persons",label:t("csvColPersons")},{id:"cause",label:t("csvColCause")},
      {id:"action",label:t("csvColAction")},{id:"responsible",label:t("complianceColResponsible")},
      {id:"status",label:t("riskColStatus")}
    ]},
    waste_register: { label:t("csvLabelWaste"), cols:[
      {id:"date",label:t("csvColDate")},{id:"waste_type",label:t("csvColWasteType")},
      {id:"qty_units",label:t("csvColQtyUnits")},{id:"qty_kg",label:t("csvColQtyKg")},
      {id:"source",label:t("csvColSource")},{id:"r5",label:t("csv5R")},
      {id:"disposal_route",label:t("csvColDisposalRoute")},{id:"recycler",label:t("csvColRecycler")},
      {id:"certificate",label:t("csvColCertificate")},{id:"responsible",label:t("complianceColResponsible")}
    ]},
    grievance_log: { label:t("csvLabelGrievance"), cols:[
      {id:"case_id",label:t("csvColCaseNo")},{id:"date_received",label:t("csvColDateReceived")},
      {id:"channel",label:t("csvColChannel")},{id:"complainant",label:t("csvColComplainant")},
      {id:"category",label:t("riskColCategory")},{id:"description",label:t("csvColDescription")},
      {id:"level",label:t("csvColLevel")},{id:"assigned_to",label:t("csvColAssignedTo")},
      {id:"action",label:t("csvColAction")},{id:"satisfied",label:t("csvColSatisfied")},
      {id:"date_closed",label:t("csvColDateClosed")}
    ]},
    training_register: { label:t("csvLabelTraining"), cols:[
      {id:"date",label:t("csvColDate")},{id:"module",label:t("csvColModule")},
      {id:"facilitator",label:t("csvColFacilitator")},{id:"participants",label:t("csvColParticipants")},
      {id:"target_group",label:t("csvColTargetGroup")},{id:"duration",label:t("csvColDuration")},
      {id:"method",label:t("csvColMethod")},{id:"assessment",label:t("csvColAssessment")},
      {id:"cert_no",label:t("csvColCertificate")},{id:"notes",label:t("csvColNotes")}
    ]},
    stakeholder_register: { label:t("csvLabelStakeholder"), cols:[
      {id:"group",label:t("csvColGroup")},{id:"interests",label:t("csvColInterests")},
      {id:"influence",label:t("csvColInfluence")},{id:"impact",label:t("csvColImpact")},
      {id:"relationship",label:t("csvColRelationship")},{id:"method",label:t("csvColMethod")},
      {id:"frequency",label:t("csvColFrequency")},{id:"responsible",label:t("complianceColResponsible")},
      {id:"last_engaged",label:t("csvColLastEngaged")}
    ]},
    supplier_assessment: { label:t("csvLabelSupplier"), cols:[
      {id:"supplier",label:t("csvColSupplier")},{id:"country",label:t("csvColCountry")},
      {id:"category",label:t("riskColCategory")},{id:"spend",label:t("csvColSpend")},
      {id:"es_policy",label:t("csvColESPolicy")},{id:"child_labour",label:t("csvColChildLabour")},
      {id:"forced_labour",label:t("csvColForcedLabour")},{id:"ewaste",label:t("csvColEwaste")},
      {id:"certified",label:t("csvColCertified")},{id:"last_review",label:t("csvColLastReview")},
      {id:"action",label:t("complianceColAction")}
    ]},
    esap: { label:t("csvLabelEsap"), cols:[
      {id:"cat",label:t("esapCategory")},{id:"objective",label:t("esapObjective")},
      {id:"output",label:t("esapOutput")},{id:"actions",label:t("esapActions")},
      {id:"kpi",label:t("esapKpi")},{id:"baseline",label:t("esapBaseline")},
      {id:"target",label:t("esapTarget")},{id:"deadline",label:t("esapDeadline")},
      {id:"responsible",label:t("esapResponsible")},{id:"budget",label:t("esapBudget")},
      {id:"verifier",label:t("esapVerifier")},{id:"status",label:t("riskColStatus")}
    ]},
  };
}

// ══════════════════════════════════════════════════
//  DATA → SECTIONS converters (same as before)
// ══════════════════════════════════════════════════

function buildScreeningSections(esmsData) {
  const d = (esmsData?.screening_q?.data) || {};
  const out = [{type:'heading',text:'E&S Screening Questionnaire'}];
  out.push({type:'infobox',text:'Based on ROGEAP ESMS Guidelines Table 6. A "Yes" to any exclusion criterion disqualifies from ROGEAP financing.'});
  const groups = [
    {label:'Exclusion Criteria',keys:['forced_labour','child_labour','ewaste_noncompliant','ohs_incidents','gbv_cases','discrimination']},
    {label:'ESMS & Policies',keys:['has_es_policy','es_training','hr_policy','hr_labour_laws','hr_nondiscrim','hr_no_child','hr_no_forced','worker_grievance']},
    {label:'OHS',keys:['ohs_policy','ohs_officer','ppe_provided','ohs_training','incident_system','code_of_conduct','gbv_training','ohs_monitoring']},
    {label:'E-Waste & Environment',keys:['battery_collection','battery_recycling','buyback','systematic_collection','ewaste_education']},
    {label:'Stakeholder Engagement & GRM',keys:['sep_exists','public_education','stakeholders_identified','stakeholder_events','grievance_written']},
  ];
  for (const g of groups) {
    out.push({type:'subheading',text:g.label});
    for (const key of g.keys) {
      const v = d[key];
      if (v) {
        const ans = v.answer||'Not answered';
        const notes = v.notes?`\nNotes: ${v.notes}`:'';
        out.push({type:'label_value',label:key.replace(/_/g,' '),value:`Answer: ${ans}${notes}`});
      }
    }
  }
  return out;
}

function buildPolicySections(esmsData) {
  const out = [{type:'heading',text:'Organisational Policies'}];
  const defs = [
    {key:'policy_es_policy_stmt',title:'E&S Policy Statement',
     fields:[['company_name','Company Name'],['mission','Mission / Vision'],['env_commitments','Environmental Commitments'],['social_commitments','Social Commitments'],['governance','Governance & Standards'],['policy_text','Full Policy Statement'],['signatory','Signatory']]},
    {key:'policy_hr_policy_stmt',title:'HR Policy',
     fields:[['hr_scope','Scope'],['eeo','Equal Employment Opportunity'],['non_disc_pol','Non-Discrimination & Anti-Harassment'],['compensation_pol','Compensation & Benefits'],['working_hours_pol','Working Hours & Overtime'],['leave_pol','Leave Policy'],['foa_pol','Freedom of Association'],['no_forced_pol','Prohibition of Forced & Child Labour'],['grievance_hr','Worker Grievance Mechanism'],['hr_pol_sign','Signatory']]},
    {key:'policy_hs_policy_stmt',title:'Health & Safety Policy',
     fields:[['hs_commitment','Management Commitment'],['hs_objectives','OHS Objectives'],['hs_resp','Responsibilities'],['hs_sign','Signatory']]},
    {key:'policy_consumer_policy_stmt',title:'Consumer Protection Policy',
     fields:[['cp_statement','Policy Statement'],['cp_principles','Commitments'],['cp_resp','Responsibilities'],['cp_policy_sign','Signatory']]},
    {key:'policy_waste_policy_stmt',title:'Waste Management Policy',
     fields:[['waste_statement','Policy Statement'],['waste_commitments','Commitments'],['waste_pol_sign','Signatory']]},
    {key:'policy_gender_policy_stmt',title:'Gender Equity & Inclusion Policy',
     fields:[['gender_statement','Policy Statement'],['gender_commitments','Commitments'],['seah_procedure','GBV/SEAH Procedure'],['gender_signatory','Signatory']]},
  ];
  for (const pol of defs) {
    const d = esmsData[pol.key]||{};
    if (!Object.values(d).some(v=>v)) continue;
    out.push({type:'subheading',text:pol.title});
    for (const [fid,flabel] of pol.fields) {
      const v = d[fid]; if (!v) continue;
      if (typeof v==='object'&&v.sel) {
        const items=[...(v.sel||[]),...(v.custom||[]).filter(c=>c.checked).map(c=>c.text||c)];
        if (items.length) out.push({type:'checklist',label:flabel,items});
      } else {
        const vs=safe(v); if (vs.trim()) out.push({type:'label_value',label:flabel,value:vs});
      }
    }
    out.push({type:'spacer'});
  }
  if (out.length===1) out.push({type:'paragraph',text:'(No policy content entered yet)'});
  return out;
}

function buildRiskSections(esmsData) {
  const rows = (esmsData?.risk_register?.data)||[];
  const rated = rows.map(r=>{
    const score=parseInt(r.prob||1)*parseInt(r.sev||1);
    return {...r,rating:score>=9?'CRITICAL':score>=6?'HIGH':score>=3?'MEDIUM':'LOW'};
  });
  return [
    {type:'heading',text:'E&S Risk Register & Assessment'},
    {type:'infobox',text:'Risk Rating = Probability × Severity. CRITICAL (9-16) | HIGH (6-8) | MEDIUM (3-5) | LOW (1-2). Source: ROGEAP ESMS Guidelines §4.'},
    {type:'table',label:'Risk Register',rows:rated,cols:[
      {id:'risk',label:'Risk / Hazard'},{id:'category',label:'Category'},
      {id:'prob',label:'Prob.'},{id:'sev',label:'Sev.'},{id:'rating',label:'Rating'},
      {id:'mitigation',label:'Mitigation'},{id:'responsible',label:'Responsible'},{id:'status',label:'Status'}
    ]}
  ];
}

function buildComplianceSections(esmsData, t) {
  const rows = (esmsData?.compliance_tracker?.data)||[];
  const cols = t
    ? getToolCSVDefs(t).compliance.cols.slice(0,7)
    : [{id:'law',label:'Law'},{id:'authority',label:'Authority'},{id:'requirement',label:'Key Requirement'},{id:'applies',label:'Applies?'},{id:'status',label:'Status'},{id:'expiry',label:'Expiry'},{id:'responsible',label:'Responsible'}];
  return [
    {type:'heading',text:'Legal & Regulatory Compliance Register'},
    {type:'infobox',text:'Tracks all applicable national laws, regulations, permits, and voluntary standards. Review quarterly.'},
    {type:'table',label:t?t('csvLabelCompliance'):'Compliance Register',rows,cols}
  ];
}

const PLAN_FIELD_MAP = {
  ohs:[['scope','Scope & Management Commitment'],['safety_committee','Safety Committee'],['hazard_summary','Key Hazards & Controls'],['training_ohs','Training Programme'],['incident_proc','Incident Reporting Procedure'],['ohs_targets','OHS Performance Targets']],
  community_hs:[['community_map','Affected Communities'],['product_safety','Product Safety Standards'],['installation_safety','Installation Safety'],['waste_community','Community E-Waste Impacts'],['community_kpis','Targets']],
  consumer:[['gogla_status','GOGLA CP Code Status'],['transparency_plan','Transparency'],['responsible_sales_plan','Responsible Sales'],['service_plan','Customer Service'],['consumer_kpis','Targets']],
  waste:[['waste_streams','Waste Streams & Volumes'],['r5_strategy_wmp','5R Strategy'],['takeback_wmp','Take-Back Scheme'],['storage_wmp','E-Waste Storage'],['partners_wmp','Disposal Partners'],['waste_kpis','Targets']],
  epr:[['scenarios_epr','Emergency Scenarios'],['ert','Emergency Response Team'],['fire_proc_epr','Fire Response'],['electrical_epr','Electrical Incident'],['battery_epr','Battery Emergency'],['drills_epr','Drill Schedule']],
  hr_plan:[['workforce','Workforce Profile'],['recruitment_hr','Recruitment & Equal Opportunity'],['wages_hr','Wages, Hours & Benefits'],['women_plan',"Women's Health & Safety"],['coc_rollout','Code of Conduct Rollout']],
  sep_plan:[['sep_objectives','Objectives'],['key_engagement','Engagement Activities'],['fpic_sep','FPIC Principles'],['gender_sep','Gender-Inclusive Engagement'],['sep_records','Documentation']],
};
const PLAN_TITLES = {ohs:'OHS Plan',community_hs:'Community Health & Safety Plan',consumer:'Consumer Protection Plan',waste:'Waste Management Plan',epr:'Emergency Preparedness & Response Plan',hr_plan:'HR Management Plan',sep_plan:'Stakeholder Engagement Plan'};

function buildPlanSections(esmsData) {
  const out = [{type:'heading',text:'E&S Management Plans'}];
  for (const [pid,fields] of Object.entries(PLAN_FIELD_MAP)) {
    const d = esmsData[`plan_${pid}`]||{};
    if (!fields.some(([fid])=>d[fid]?.trim?.()||d[fid])) continue;
    out.push({type:'subheading',text:PLAN_TITLES[pid]||pid});
    for (const [fid,flabel] of fields) {
      const v=d[fid]; if (!v?.trim?.()) continue;
      out.push({type:'label_value',label:flabel,value:v});
    }
    out.push({type:'spacer'});
  }
  if (out.length===1) out.push({type:'paragraph',text:'(No management plan content entered yet)'});
  return out;
}

function buildToolSection(toolId, esmsData, t) {
  const defs = getToolCSVDefs(t);
  const def = defs[toolId];
  if (!def) return [];
  const raw = esmsData[`tool_${toolId}`]?.data;
  const rows = Array.isArray(raw)?raw:[];
  const reg = TOOLS_REGISTRY[toolId];
  const title = (reg?.lk ? t(reg.lk) : null) || def.label;
  return [{type:'heading',text:title},{type:'table',label:def.label,rows,cols:def.cols}];
}

function buildCOCSections(esmsData) {
  const d = esmsData?.tool_coc?.data||{};
  const out = [{type:'heading',text:'Code of Conduct'}];
  if (d.company_name) out.push({type:'label_value',label:'Company',value:d.company_name});
  if (d.effective_date) out.push({type:'label_value',label:'Effective Date',value:d.effective_date});
  if (d.preamble) out.push({type:'label_value',label:'Preamble',value:d.preamble});
  if (d.items?.sel?.length) out.push({type:'checklist',label:'Code Requirements',items:d.items.sel});
  if (d.consequences) out.push({type:'label_value',label:'Consequences of Violation',value:d.consequences});
  if (d.reporting) out.push({type:'label_value',label:'Reporting Violations',value:d.reporting});
  return out;
}

function buildMonitoringSections(esmsData) {
  const d = esmsData?.tool_monitoring_form?.data||{};
  const out = [{type:'heading',text:'ROGEAP E&S Monitoring Form'}];
  if (d.company) out.push({type:'label_value',label:'Company',value:d.company});
  if (d.period_from||d.period_to) out.push({type:'label_value',label:'Reporting Period',value:`${d.period_from||''} — ${d.period_to||''}`});
  if (d.completed_by) out.push({type:'label_value',label:'Completed By',value:`${d.completed_by} | ${d.position||''}`});
  const yn=[['esms_developed_yn','ESMS Developed'],['esap_progress_yn','ESAP On Track'],
    ['training_conducted_yn','Training Delivered'],['incidents_yn','Incidents Recorded'],
    ['grievances_yn','Grievances Received'],['seah_complaints_yn','GBV/SEAH Complaints (Y/N only)']];
  for (const [k,lbl] of yn) {
    if (d[k]) out.push({type:'label_value',label:lbl,value:d[k]});
  }
  if (d.kpi_summary) out.push({type:'label_value',label:'KPI Summary',value:d.kpi_summary});
  if (d.next_actions) out.push({type:'label_value',label:'Next Period Actions',value:d.next_actions});
  if (d.signature) out.push({type:'label_value',label:'Signature',value:d.signature});
  return out;
}

function buildESAPSections(esmsData) {
  const rows = esmsData?.tool_esap?.data||[];
  return [
    {type:'heading',text:'Environmental & Social Action Plan (ESAP)'},
    {type:'infobox',text:'ROGEAP-aligned ESAP (Table 23 of Guidelines). Required for all ROGEAP applicants.'},
    {type:'table',label:'ESAP Actions',rows,cols:[
      {id:'cat',label:'Category'},{id:'objective',label:'Objective'},
      {id:'actions',label:'Actions'},{id:'kpi',label:'KPI'},
      {id:'deadline',label:'Deadline'},{id:'responsible',label:'Responsible'},
      {id:'budget',label:'Budget (USD)'},{id:'status',label:'Status'}
    ]}
  ];
}

function buildFullESMSSections(esmsData, t) {
  const company = esmsData?.policy_es_policy_stmt?.company_name||'Your Company';
  const out = [
    {type:'heading',text:`${company} — Full ESMS Document`},
    {type:'infobox',text:'Generated by ROGEAP ESMS Builder. Contains all completed ESMS components. Empty sections are omitted.'},
    {type:'pagebreak'},
    ...buildScreeningSections(esmsData),{type:'pagebreak'},
    ...buildPolicySections(esmsData),{type:'pagebreak'},
    ...buildRiskSections(esmsData),{type:'pagebreak'},
    ...buildComplianceSections(esmsData,t),{type:'pagebreak'},
    ...buildPlanSections(esmsData),{type:'pagebreak'},
    ...buildCOCSections(esmsData),
    ...buildToolSection('ppe_matrix',esmsData,t),
    ...buildToolSection('incident_log',esmsData,t),
    ...buildToolSection('training_register',esmsData,t),
    ...buildToolSection('waste_register',esmsData,t),
    ...buildToolSection('grievance_log',esmsData,t),
    ...buildToolSection('stakeholder_register',esmsData,t),
    ...buildToolSection('supplier_assessment',esmsData,t),{type:'pagebreak'},
    ...buildMonitoringSections(esmsData),{type:'pagebreak'},
    ...buildESAPSections(esmsData),
  ];
  return out;
}


// ── Per-policy section builder ──
function buildSinglePolicySections(pol, d) {
  const out = [
    {type:'heading', text: pol.label},
    {type:'paragraph', text: pol.desc || ''}
  ];
  for (const f of pol.fields) {
    const v = d[f.id];
    if (!v) continue;
    if (typeof v === 'object' && Array.isArray(v.sel)) {
      const items = [
        ...(v.sel || []),
        ...(v.custom || []).filter(c => c.checked).map(c => c.text || c)
      ];
      if (items.length) out.push({type:'checklist', label: f.label, items});
    } else {
      const vs = safe(v);
      if (vs.trim()) out.push({type:'label_value', label: f.label, value: vs});
    }
  }
  return out;
}

// ── Per-plan section builder ──
function buildSinglePlanSections(plan, d, t) {
  const out = [
    {type:'heading', text: t ? t(plan.lk) : (plan.label || '')},
    {type:'paragraph', text: `${plan.required || ''}`},
    {type:'paragraph', text: t ? t(plan.ik) : (plan.intro || '')}
  ];
  for (const f of plan.fields) {
    const v = d[f.id];
    if (!v) continue;
    if (typeof v === 'object' && Array.isArray(v.sel)) {
      const items = [
        ...(v.sel || []),
        ...(v.custom || []).filter(c => c.checked).map(c => c.text || c)
      ];
      if (items.length) out.push({type:'checklist', label: f.label, items});
    } else {
      const vs = safe(v);
      if (vs && vs.trim()) out.push({type:'label_value', label: f.label, value: vs});
    }
  }
  return out;
}

// ══════════════════════════════════════════════════
//  EXPORT BUTTON BAR
// ══════════════════════════════════════════════════
function ExportBar({ title, sections, csvToolId, csvRows, csvCols, filename, esmsData, isFull=false }) {
  const { t } = useLang();
  const [busy, setBusy] = useState(null);
  const fname = (filename||title||'ESMS').replace(/[^a-zA-Z0-9]/g,'_');

  const run = (type) => {
    setBusy(type);
    try {
      const secs = isFull ? buildFullESMSSections(esmsData, t) : (sections||[]);
      const docTitle = isFull ? (esmsData?.policy_es_policy_stmt?.company_name ? `${esmsData.policy_es_policy_stmt.company_name} — Full ESMS` : 'Full ESMS Document') : (title||'ESMS Document');
      const strings = {
        noEntries: t('noEntries'),
        notCompleted: t('notCompleted'),
        coverLine: t('exportCoverLine'),
        footerLine: t('exportFooterLine'),
        generated: t('exportGenerated'),
      };

      if (type==='pdf') {
        exportPDF(docTitle, secs, strings);
      } else if (type==='word') {
        exportWord(docTitle, secs, strings);
      } else if (type==='csv') {
        const toolDefs = getToolCSVDefs(t);
        const cols = csvCols||(csvToolId?toolDefs[csvToolId]?.cols:null);
        const rows = csvRows||(csvToolId?(esmsData?.[`tool_${csvToolId}`]?.data||[]):[]);
        if (cols) exportCSV(`${fname}.csv`, cols, rows);
        else alert('No tabular data to export as CSV for this section.');
      }
    } catch(e) {
      console.error('Export error:', e);
      alert(`Export error: ${e.message}`);
    }
    setTimeout(()=>setBusy(null), 800);
  };

  const hasCsv = !!(csvToolId||(csvCols&&csvRows));
  const base = {
    border:'none', borderRadius:7, padding:'7px 13px', cursor:'pointer',
    fontSize:12, fontWeight:700, fontFamily:F.b,
    display:'flex', alignItems:'center', gap:5,
    transition:'all 0.15s', flexShrink:0,
    opacity: busy?0.65:1, pointerEvents: busy?'none':'auto',
  };

  if (isFull) {
    return (
      <div style={{display:'flex',flexDirection:'column',gap:5}}>
        <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:2}}>
          📥 Download Full ESMS
        </div>
        <button onClick={()=>run('pdf')} style={{...base,background:'rgba(192,57,43,0.25)',color:'rgba(255,200,200,0.9)',border:'1px solid rgba(192,57,43,0.4)',justifyContent:'center'}}>
          {busy==='pdf'?t('generating'):t('fullPdf')}
        </button>
        <button onClick={()=>run('word')} style={{...base,background:'rgba(42,95,158,0.3)',color:'rgba(180,210,255,0.9)',border:'1px solid rgba(42,95,158,0.5)',justifyContent:'center'}}>
          {busy==='word'?t('generating'):t('fullWord')}
        </button>
      </div>
    );
  }

  return (
    <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
      <span style={{fontSize:11,color:C.muted,fontWeight:600}}>{t('exportLabel')}</span>
      <button onClick={()=>run('pdf')} style={{...base,background:'#FDECEA',color:C.red,border:`1.5px solid ${C.red}`}}>
        {busy==='pdf'?'⏳':'📄'} {t('exportPdf').replace('📄 ','')}
      </button>
      <button onClick={()=>run('word')} style={{...base,background:'#EBF5FB',color:C.navyLight,border:`1.5px solid ${C.navyLight}`}}>
        {busy==='word'?'⏳':'📝'} {t('exportWord').replace('📝 ','')}
      </button>
      {hasCsv&&(
        <button onClick={()=>run('csv')} style={{...base,background:'#E8F8F5',color:C.teal,border:`1.5px solid ${C.teal}`}}>
          {busy==='csv'?'⏳':'📊'} {t('exportCsv').replace('📊 ','')}
        </button>
      )}
    </div>
  );
}




// ═══════════════ MAIN APP ═══════════════
export default function App() {
  const [active, setActive] = useLS("esms_v4_active", "welcome");
  const [esmsData, setEsmsData] = useLS("esms_v4_data", {});
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== "undefined" ? window.innerWidth > 768 : true);
  const [guideOpen, setGuideOpen] = useState(null);
  const [lang, setLang] = useLS("esms_lang", "en");
  const mainRef = useRef(null);

  // Sync HTML lang attribute for browser translate / a11y
  useEffect(() => {
    document.documentElement.lang = lang === 'fr' ? 'fr' : lang === 'pt' ? 'pt' : 'en';
  }, [lang]);

  // Translation function — falls back to English if key missing
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  // Build translated NAV on each render
  const NAV = NAV_DEFS.map(n => ({ ...n, label: t(n.tKey) }));

  const setFieldValue = (compId, fieldId, value) => {
    setEsmsData(prev => ({ ...prev, [compId]: { ...(prev[compId]||{}), [fieldId]: value } }));
  };
  const goTo = (id) => { setActive(id); if (mainRef.current) mainRef.current.scrollTop = 0; };
  const openGuide = (id) => setGuideOpen(id);
  const closeGuide = () => setGuideOpen(null);

  // ── JSON Backup / Restore ──
  const backupData = () => {
    try {
      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        lang,
        esmsData,
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ESMS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
    } catch(e) {
      alert('Could not save backup: ' + e.message);
    }
  };

  const restoreData = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        if (backup && typeof backup.esmsData === 'object') {
          if (window.confirm('Restore this backup? All current data will be replaced.')) {
            setEsmsData(backup.esmsData);
            if (backup.lang) setLang(backup.lang);
            setActive('welcome');
          }
        } else {
          alert('Invalid backup file. Please select a valid ESMS Builder .json backup file.');
        }
      } catch(err) {
        alert('Could not read backup file. Make sure it is a valid JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  // Inject openGuide into every section via prop
  const renderContent = () => {
    switch(active) {
      case "welcome": return <Welcome esmsData={esmsData} setActive={goTo} openGuide={openGuide} nav={NAV}/>;
      case "screening": return <ScreeningSection esmsData={esmsData} setFieldValue={setFieldValue} openGuide={openGuide}/>;
      case "policy": return <PolicySection esmsData={esmsData} setFieldValue={setFieldValue} openGuide={openGuide}/>;
      case "risks": return <RiskSection esmsData={esmsData} setFieldValue={setFieldValue} openGuide={openGuide}/>;
      case "compliance": return <ComplianceSection esmsData={esmsData} setFieldValue={setFieldValue} openGuide={openGuide}/>;
      case "plans": return <ManagementPlansSection esmsData={esmsData} setFieldValue={setFieldValue} openGuide={openGuide}/>;
      case "tools": return <ToolsSection esmsData={esmsData} setFieldValue={setFieldValue} openGuide={openGuide}/>;
      case "esap": return (
        <div>
          <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:18, paddingBottom:18, borderBottom:`2px solid ${C.border}` }}>
            <div style={{ fontSize:34 }}>📝</div>
            <div style={{ flex:1 }}>
              <h2 style={{ margin:0, color:C.text, fontSize:22, fontFamily:F.d }}>{t("esapTitle")}</h2>
              <p style={{ margin:"8px 0 0", color:C.muted, fontSize:14, lineHeight:1.6 }}>{t("esapDesc")}</p>
            </div>
            <GuideBtn guideId="esap" onOpen={openGuide}/>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
            <ExportBar title="ESAP" filename="ESMS_ESAP"
              sections={buildESAPSections(esmsData)} csvToolId="esap" esmsData={esmsData}/>
          </div>
          <ESAPTable value={esmsData["tool_esap"]?.data} onChange={v => setFieldValue("tool_esap","data",v)}/>
        </div>
      );
      default: return null;
    }
  };

  const activeIdx = NAV.findIndex(n => n.id === active);
  const isMobile = useIsMobile();

  // Close sidebar when navigating on mobile
  const mobileGoTo = (id) => { goTo(id); if(isMobile) setSidebarOpen(false); };

  // Bottom-nav shows first 5 items (home + 4 key sections)
  const BOTTOM_NAV = NAV.slice(0, 5);

  return (
    <LangContext.Provider value={{ lang, t }}>
    {/* ── SKIP LINK (keyboard / screen reader navigation) ── */}
    <a href="#main-content" className="skip-link">Skip to main content</a>

    <div lang={lang} translate="yes" className="app-root" style={{ fontFamily:F.b, background:C.bg, color:C.text }}>
      {/* GUIDELINES PANEL OVERLAY */}
      {guideOpen && <GuidelinesPanel guideId={guideOpen} onClose={closeGuide}/>}

      {/* ── MOBILE HEADER BAR ── */}
      <header id="mobile-header" role="banner">
        <button
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background:"none", border:"none", color:"white", cursor:"pointer", fontSize:22, padding:"0 4px", flexShrink:0, lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center", width:44, height:44 }}>
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <span style={{ color:"white", fontWeight:700, fontSize:14, fontFamily:F.d, flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          🌿 {t("appName")}
        </span>
        <select value={lang} onChange={e => setLang(e.target.value)}
          aria-label="Language"
          style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:6, color:"white", fontSize:12, cursor:"pointer", fontFamily:F.b, outline:"none", padding:"4px 6px", maxWidth:110 }}>
          <option value="en" style={{background:"#0D2038"}}>🌐 English</option>
          <option value="fr" style={{background:"#0D2038"}}>🌐 Français</option>
          <option value="pt" style={{background:"#0D2038"}}>🌐 Português</option>
        </select>
      </header>

      {/* ── SIDEBAR BACKDROP (mobile only) ── */}
      <div id="sidebar-backdrop" className={sidebarOpen && isMobile ? "backdrop-open" : ""}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"/>

      {/* ── SIDEBAR ── */}
      <div
        id="app-sidebar"
        role="navigation"
        aria-label="Main navigation"
        className={`app-sidebar${sidebarOpen && isMobile ? " sidebar-open" : ""}`}
        style={{ width:sidebarOpen?260:56, flexShrink:0, background:C.navyDark, display:"flex", flexDirection:"column", transition:"width 0.2s ease", overflow:"hidden" }}>

        {/* Sidebar header */}
        <div style={{ padding:sidebarOpen?"16px 12px":"16px 9px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <span style={{ fontSize:19, flexShrink:0 }}>🌿</span>
            {sidebarOpen && <span style={{ color:"white", fontWeight:700, fontSize:14, fontFamily:F.d, whiteSpace:"nowrap", flex:1 }}>{t("appName")}</span>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? t("collapseNav") : t("expandNav")}
              aria-expanded={sidebarOpen}
              style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:15, padding:6, flexShrink:0, minWidth:36, minHeight:36, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {sidebarOpen ? t("collapseNav") : t("expandNav")}
            </button>
          </div>
          {sidebarOpen && <div style={{ marginTop:9, background:"rgba(255,255,255,0.09)", borderRadius:7, padding:"6px 10px", fontSize:11, color:"rgba(255,255,255,0.6)" }}>{t("appEdition")}</div>}
          {sidebarOpen && (
            <select value={lang} onChange={e => setLang(e.target.value)}
              aria-label="Language"
              style={{ marginTop:8, width:"100%", padding:"8px", background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:6, color:"rgba(255,255,255,0.9)", fontSize:12, cursor:"pointer", fontFamily:F.b, outline:"none" }}>
              <option value="en" style={{background:"#0D2038"}}>🌐 English</option>
              <option value="fr" style={{background:"#0D2038"}}>🌐 Français</option>
              <option value="pt" style={{background:"#0D2038"}}>🌐 Português</option>
            </select>
          )}
        </div>

        {/* Nav items */}
        <nav aria-label="Sections" style={{ flex:1, padding:"9px 6px", overflowY:"auto" }}>
          {NAV.map(item => {
            const isA = active === item.id;
            return (
              <button key={item.id}
                onClick={() => mobileGoTo(item.id)}
                aria-label={item.label}
                aria-current={isA ? "page" : undefined}
                className="nav-btn"
                style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:sidebarOpen?"8px 10px":"8px", justifyContent:sidebarOpen?"flex-start":"center", background:isA?"rgba(255,255,255,0.15)":"transparent", border:"none", borderRadius:7, cursor:"pointer", color:isA?"white":"rgba(255,255,255,0.65)", fontWeight:isA?700:400, fontSize:12, marginBottom:2, textAlign:"left", fontFamily:F.b }}
                onMouseEnter={e => { if(!isA) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { if(!isA) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize:14, flexShrink:0 }} aria-hidden="true">{item.icon}</span>
                {sidebarOpen && <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom action buttons */}
        {sidebarOpen && (
          <div style={{ padding:"10px 12px", borderTop:"1px solid rgba(255,255,255,0.1)", display:"flex", flexDirection:"column", gap:5 }}>
            <ExportBar isFull={true} esmsData={esmsData} filename="Full_ESMS_Document" title="Full ESMS Document" sections={[]}/>
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:7, display:"flex", flexDirection:"column", gap:5 }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:1 }}>{t("backupLabel")}</div>
              <button onClick={backupData}
                style={{ width:"100%", background:"rgba(14,124,123,0.25)", border:"1px solid rgba(14,124,123,0.5)", borderRadius:6, padding:"9px 0", color:"rgba(150,230,228,0.9)", cursor:"pointer", fontSize:11, fontFamily:F.b }}>
                {t("backupSave")}
              </button>
              <label style={{ display:"block", width:"100%", background:"rgba(42,95,158,0.2)", border:"1px solid rgba(42,95,158,0.4)", borderRadius:6, padding:"9px 0", color:"rgba(160,200,255,0.9)", cursor:"pointer", fontSize:11, fontFamily:F.b, textAlign:"center" }}>
                {t("backupRestore")}
                <input type="file" accept=".json" aria-label="Restore data from backup file" onChange={e => { if(e.target.files?.[0]) { restoreData(e.target.files[0]); e.target.value=''; } }} style={{ display:"none" }}/>
              </label>
              <button onClick={() => { if(window.confirm(t("resetConfirm"))) { setEsmsData({}); setActive("welcome"); } }}
                style={{ width:"100%", background:"rgba(192,57,43,0.2)", border:"1px solid rgba(192,57,43,0.4)", borderRadius:6, padding:"9px 0", color:"rgba(255,180,180,0.85)", cursor:"pointer", fontSize:11, fontFamily:F.b }}>
                {t("resetData")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <main id="main-content" ref={mainRef} className="app-main" role="main" style={{ flex:1, padding:"28px 32px 48px", overflowX:"hidden", overflowY:"auto", maxHeight:"100vh" }}>
        <div className="app-content-inner" style={{ maxWidth:1000, margin:"0 auto" }}>
          {renderContent()}
          {active !== "welcome" && (
            <div style={{ marginTop:32, paddingTop:18, borderTop:`2px solid ${C.border}`, display:"flex", gap:10, flexWrap:"wrap" }}>
              {activeIdx > 0 && <button onClick={() => mobileGoTo(NAV[activeIdx-1].id)} style={S.outBtn}>← {NAV[activeIdx-1].label}</button>}
              <div style={{ flex:1 }}/>
              {activeIdx < NAV.length-1 && <button onClick={() => mobileGoTo(NAV[activeIdx+1].id)} style={S.btn}>{NAV[activeIdx+1].label} →</button>}
            </div>
          )}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <nav id="mobile-bottom-nav" aria-label="Quick navigation">
        {BOTTOM_NAV.map(item => {
          const isA = active === item.id;
          return (
            <button key={item.id}
              onClick={() => mobileGoTo(item.id)}
              aria-label={item.label}
              aria-current={isA ? "page" : undefined}
              style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, padding:"4px 0", color:isA?"white":"rgba(255,255,255,0.5)", transition:"color 0.15s" }}>
              <span style={{ fontSize:18, lineHeight:1 }} aria-hidden="true">{item.icon}</span>
              <span style={{ fontSize:9, fontWeight:isA?700:400, whiteSpace:"nowrap", maxWidth:56, overflow:"hidden", textOverflow:"ellipsis" }}>{item.label.replace(/^\d+\.\s/,"")}</span>
              {isA && <div style={{ width:4, height:4, borderRadius:"50%", background:"#15A09F", marginTop:2 }}/>}
            </button>
          );
        })}
        {/* More button opens sidebar */}
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open full navigation menu"
          style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, padding:"4px 0", color:"rgba(255,255,255,0.5)" }}>
          <span style={{ fontSize:18, lineHeight:1 }} aria-hidden="true">⋯</span>
          <span style={{ fontSize:9 }}>More</span>
        </button>
      </nav>

    </div>
    </LangContext.Provider>
  );
}
