// @ts-nocheck
import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";
import { TRANSLATIONS, LangContext, useLang } from "./i18n/translations.js";
import { GUIDE_TRANSLATIONS } from "./i18n/guideTranslations.js";

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
  td:{padding:"8px 11px",borderBottom:`1px solid ${C.border}`,verticalAlign:"top",fontSize:13},
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

// ═══════════════ SYNC SCROLLBAR WRAPPER ═══════════════
// Mirrors a scrollbar strip ABOVE the table so users can scroll horizontally
// without first scrolling to the bottom of the page to reach the native scrollbar.
function SyncScroll({children,minWidth=950}){
  const topRef=useRef(null);
  const botRef=useRef(null);
  const busy=useRef(false);
  const onTop=()=>{if(busy.current)return;busy.current=true;if(botRef.current)botRef.current.scrollLeft=topRef.current.scrollLeft;busy.current=false;};
  const onBot=()=>{if(busy.current)return;busy.current=true;if(topRef.current)topRef.current.scrollLeft=botRef.current.scrollLeft;busy.current=false;};
  return(
    <div>
      <div ref={topRef} onScroll={onTop} aria-hidden="true"
        style={{overflowX:"scroll",overflowY:"hidden",background:"#F0F2F4",borderRadius:"6px 6px 0 0",border:"1px solid #DDE1E6",borderBottom:"none"}}>
        <div style={{height:1,minWidth}}/>
      </div>
      <div ref={botRef} onScroll={onBot} style={{overflowX:"auto",border:"1px solid #DDE1E6",borderTop:"none",borderRadius:"0 0 4px 4px"}}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════ LIVE TABLE BUILDER ═══════════════
// Users can edit cell content, add rows, remove rows
function TableBuilder({columns,baselineRows,value,onChange,addRowLabel="Add Row",minWidth=950}){
  const {t}=useLang();
  const rows=(Array.isArray(value)&&value.length>0)?value:(Array.isArray(baselineRows)?baselineRows:[]);
  const updateCell=(ri,ci,v)=>{const r=[...rows];r[ri]={...r[ri],[ci]:v};onChange(r);};
  const addRow=()=>{const blank={};columns.forEach(c=>{blank[c.id]="";});onChange([...rows,blank]);};
  const removeRow=i=>onChange(rows.filter((_,j)=>j!==i));
  return(<div>
    <SyncScroll minWidth={minWidth}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth}}>
      <thead><tr>{columns.map(c=><th key={c.id} style={{...S.th,width:c.w||"auto",minWidth:c.minW||undefined}}>{c.lk?t(c.lk):c.label}</th>)}<th style={{...S.th,width:40}}></th></tr></thead>
      <tbody>
        {rows.map((row,ri)=>(
          <tr key={ri} style={{background:ri%2===0?"white":"#FAFBFC"}}>
            {columns.map(c=>(
              <td key={c.id} style={S.td}>
                {c.type==="sel"
                  ?<select value={row[c.id]||""} onChange={e=>updateCell(ri,c.id,e.target.value)} style={{...S.inp,padding:"6px 8px",minWidth:"100%"}}>
                    <option value="">—</option>
                    {c.opts.map((o,i)=><option key={o} value={o}>{c.transOpts?c.transOpts[i]:o}</option>)}
                  </select>
                  :c.type==="ta"
                    ?<textarea value={row[c.id]||""} onChange={e=>updateCell(ri,c.id,e.target.value)} placeholder={c.ph||""} rows={4} style={{...S.ta,padding:"6px 8px",minWidth:"100%"}}/>
                    :<input value={row[c.id]||""} onChange={e=>updateCell(ri,c.id,e.target.value)} placeholder={c.ph||""} style={{...S.inp,padding:"6px 8px"}}/>}
              </td>
            ))}
            <td style={{...S.td,textAlign:"center",padding:0}}><button onClick={()=>removeRow(ri)} aria-label="Remove row" className="remove-btn" style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:18,lineHeight:1,width:44,height:44}}>×</button></td>
          </tr>
        ))}
      </tbody>
    </table>
    </SyncScroll>
    <button onClick={addRow} style={{...S.outBtn,marginTop:10,fontSize:12,color:C.teal,borderColor:C.teal,display:"flex",alignItems:"center",gap:6}}>➕ {addRowLabel}</button>
  </div>);
}

// ═══════════════ SCORED RISK MATRIX ═══════════════
function RiskMatrix({baselineRisks,value,onChange}){
  const {t}=useLang();
  const rows=(Array.isArray(value)&&value.length>0)?value:(Array.isArray(baselineRisks)?baselineRisks:[]).map(r=>({...r,applies:"yes",prob:r.prob||"2",sev:r.sev||"2",mitigation:r.mitigation||"",responsible:"",status:"Planned"}));
  const update=(ri,k,v)=>{const r=[...rows];r[ri]={...r[ri],[k]:v};onChange(r);};
  const addRow=()=>onChange([...rows,{risk:"",category:"Other",applies:"yes",prob:"1",sev:"1",mitigation:"",responsible:"",status:"Planned"}]);
  const removeRow=i=>onChange(rows.filter((_,j)=>j!==i));
  const ratingColor=(p,s)=>{const score=parseInt(p)*parseInt(s);if(score>=9)return{bg:"#FDECEA",c:C.red,label:t("riskCritical")};if(score>=6)return{bg:"#FFF3E0",c:"#E65100",label:t("riskHigh")};if(score>=3)return{bg:"#FFFDE7",c:"#F9A825",label:t("riskMedium")};return{bg:"#E8F5E9",c:C.green,label:t("riskLow")};};
  const colHeaders=[t("riskColHazard"),t("riskColCategory"),t("riskColApplies"),t("riskColProb"),t("riskColSev"),t("riskColRating"),t("riskColMitigation"),t("riskColResponsible"),t("riskColStatus")];
  return(<div>
    <SyncScroll minWidth={1150}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:1150}}>
      <thead><tr>
        {colHeaders.map((h,i)=>
          <th key={i} style={{...S.th,width:["20%","12%","7%","5%","5%","7%","21%","10%","13%"][i]}}>{h}</th>)}
        <th style={{...S.th,width:34}}></th>
      </tr></thead>
      <tbody>
        {rows.map((row,ri)=>{
          const rc=row.applies==="yes"?ratingColor(row.prob||"1",row.sev||"1"):{bg:"white",c:C.muted,label:t("riskNA")};
          return(<tr key={ri} style={{background:row.applies==="no"?"#FAFAFA":"white"}}>
            <td style={S.td}><textarea value={row.risk||""} onChange={e=>update(ri,"risk",e.target.value)} rows={4} style={{...S.ta,padding:"6px 7px",fontSize:13}}/></td>
            <td style={S.td}><select value={row.category||""} onChange={e=>update(ri,"category",e.target.value)} style={{...S.inp,padding:"6px 7px",fontSize:12,minWidth:"100%"}}>
              <option value="">—</option>
              {[
                {v:"OHS",lk:"catOHS"},{v:"E-Waste",lk:"catEWaste"},{v:"Labour",lk:"catLabour"},
                {v:"Consumer",lk:"catConsumer"},{v:"Community",lk:"catCommunity"},
                {v:"Gender/SEAH",lk:"catGenderSEAH"},{v:"Supply Chain",lk:"catSupplyChain"},
                {v:"Security",lk:"catSecurity"},{v:"Environment",lk:"catEnvironment"},{v:"Other",lk:"catOther"}
              ].map(({v,lk})=><option key={v} value={v}>{t(lk)}</option>)}
            </select></td>
            <td style={{...S.td,textAlign:"center"}}><select value={row.applies||"yes"} onChange={e=>update(ri,"applies",e.target.value)} style={{...S.inp,padding:"6px 5px",fontSize:12,minWidth:"100%"}}>
              <option value="yes">{t("riskAppliesYes")}</option><option value="no">{t("riskAppliesNo")}</option></select></td>
            <td style={{...S.td,textAlign:"center"}}><select value={row.prob||"2"} onChange={e=>update(ri,"prob",e.target.value)} style={{...S.inp,padding:"6px 4px",fontSize:12,textAlign:"center",minWidth:"100%"}}>
              {["1","2","3","4"].map(o=><option key={o}>{o}</option>)}</select></td>
            <td style={{...S.td,textAlign:"center"}}><select value={row.sev||"2"} onChange={e=>update(ri,"sev",e.target.value)} style={{...S.inp,padding:"6px 4px",fontSize:12,textAlign:"center",minWidth:"100%"}}>
              {["1","2","3","4"].map(o=><option key={o}>{o}</option>)}</select></td>
            <td style={{...S.td,textAlign:"center"}}><span style={{background:rc.bg,color:rc.c,borderRadius:5,padding:"3px 6px",fontWeight:700,fontSize:12}}>{rc.label}</span></td>
            <td style={S.td}><textarea value={row.mitigation||""} onChange={e=>update(ri,"mitigation",e.target.value)} rows={4} style={{...S.ta,padding:"6px 7px",fontSize:13}}/></td>
            <td style={S.td}><input value={row.responsible||""} onChange={e=>update(ri,"responsible",e.target.value)} style={{...S.inp,padding:"6px 7px",fontSize:12}}/></td>
            <td style={S.td}><select value={row.status||"Planned"} onChange={e=>update(ri,"status",e.target.value)} style={{...S.inp,padding:"6px 7px",fontSize:12,minWidth:"100%"}}>
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
    </SyncScroll>
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
  const {t,lang}=useLang();
  const rows=Array.isArray(value)&&value.length>0?value:(BASELINES_I18N.incident[lang]||[]);
  const cols=[
    {id:"date",label:t("csvColDate"),w:"7%",minW:80,ph:"DD/MM/YY"},
    {id:"type",label:t("csvColType"),w:"11%",minW:130,type:"sel",opts:["Injury","Near-Miss","Property Damage","Environmental","Security","SEAH","Other"],transOpts:[t("optIncidentInjury"),t("optIncidentNearMiss"),t("optIncidentPropertyDmg"),t("optIncidentEnvironmental"),t("optIncidentSecurity"),t("optIncidentSEAH"),t("optIncidentOther")]},
    {id:"description",label:t("csvColDescription"),w:"21%",type:"ta"},
    {id:"location",label:t("csvColLocation"),w:"9%",ph:"Site/area",type:"ta"},
    {id:"persons",label:t("csvColPersons"),w:"9%",ph:"Role only"},
    {id:"cause",label:t("csvColCause"),w:"14%",type:"ta"},
    {id:"action",label:t("csvColAction"),w:"14%",type:"ta"},
    {id:"responsible",label:t("colResponsible"),w:"7%",ph:"Name"},
    {id:"status",label:t("colStatus"),w:"11%",minW:130,type:"sel",opts:["Open","In Progress","Closed","Reported to Authority"],transOpts:[t("optStatusOpen"),t("optStatusInProgress"),t("optStatusClosed"),t("optStatusReported")]},
  ];
  return(<div>
    <InfoBox col={C.red} bg="#FFF5F5">{t("incidentInfoBox")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={[]} value={rows} onChange={onChange} addRowLabel={t("incidentAddRow")} minWidth={1050}/>
  </div>);
}

// ═══════════════ WASTE REGISTER ═══════════════
function WasteRegister({value,onChange}){
  const {t}=useLang();
  const rows=value||[];
  const cols=[
    {id:"date",label:t("csvColDate"),w:"7%",minW:80,ph:"DD/MM/YY"},
    {id:"waste_type",label:t("csvColWasteType"),w:"14%",minW:155,type:"sel",opts:["Lead-acid battery","Lithium battery","Solar panel","Inverter/controller","Accessories","Packaging","Office waste","Workshop waste","Other"],transOpts:[t("optWasteLeadAcid"),t("optWasteLithium"),t("optWasteSolarPanel"),t("optWasteInverter"),t("optWasteAccessories"),t("optWastePackaging"),t("optWasteOffice"),t("optWasteWorkshop"),t("optWasteOther")]},
    {id:"qty_units",label:t("csvColQtyUnits"),w:"6%",minW:60,ph:"#"},
    {id:"qty_kg",label:t("csvColQtyKg"),w:"6%",minW:60,ph:"kg"},
    {id:"source",label:t("csvColSource"),w:"9%",ph:"Agent/area",type:"ta"},
    {id:"r5",label:t("csv5R"),w:"10%",minW:105,type:"sel",opts:["Reduce","Reuse","Repair","Refurbish","Recycle","Dispose"],transOpts:[t("optR5Reduce"),t("optR5Reuse"),t("optR5Repair"),t("optR5Refurbish"),t("optR5Recycle"),t("optR5Dispose")]},
    {id:"disposal_route",label:t("csvColDisposalRoute"),w:"13%",ph:"Recycler/landfill",type:"ta"},
    {id:"recycler",label:t("colWasteRecycler"),w:"12%",ph:"Name",type:"ta"},
    {id:"certificate",label:t("colCertNo"),w:"9%",ph:"Ref no."},
    {id:"responsible",label:t("colResponsible"),w:"7%",ph:"Name"},
  ];
  return(<div>
    <InfoBox col={C.green} bg="#F0FFF4">{t("wasteInfoBox")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={[]} value={rows} onChange={onChange} addRowLabel={t("wasteAddRow")} minWidth={1100}/>
  </div>);
}

// ═══════════════ GRIEVANCE LOG ═══════════════
function GrievanceLog({value,onChange}){
  const {t,lang}=useLang();
  const rows=Array.isArray(value)&&value.length>0?value:(BASELINES_I18N.grievance[lang]||[]);
  const cols=[
    {id:"case_id",label:t("csvColCaseNo"),w:"6%",minW:75,ph:"GRM-001"},
    {id:"date_received",label:t("csvColDateReceived"),w:"7%",minW:80,ph:"DD/MM/YY"},
    {id:"channel",label:t("csvColChannel"),w:"11%",minW:135,type:"sel",opts:["Phone/WhatsApp","Email","In-person","Suggestion box","Online form","Via agent","Anonymous","Other"],transOpts:[t("optChanPhone"),t("optChanEmail"),t("optChanInPerson"),t("optChanBox"),t("optChanOnline"),t("optChanAgent"),t("optChanAnon"),t("optChanOther")]},
    {id:"complainant",label:t("colComplainantKnown"),w:"9%",ph:"Name or 'Anon'",type:"ta"},
    {id:"category",label:t("riskColCategory"),w:"12%",minW:145,type:"sel",opts:["Working conditions","Product quality","Consumer protection","Environmental","Community","Gender/SEAH","Payment dispute","Safety","Other"],transOpts:[t("optCatWorkCond"),t("optCatProduct"),t("optCatConsumerProt"),t("optCatEnvironment"),t("optCatCommunity"),t("optCatGender"),t("optCatPayment"),t("optCatSafety"),t("optCatOther")]},
    {id:"description",label:t("csvColDescription"),w:"17%",type:"ta"},
    {id:"level",label:t("csvColLevel"),w:"8%",minW:90,type:"sel",opts:["Level 1","Level 2","Level 3"],transOpts:[t("optGrmLvl1"),t("optGrmLvl2"),t("optGrmLvl3")]},
    {id:"assigned_to",label:t("csvColAssignedTo"),w:"7%",ph:"Name"},
    {id:"action",label:t("colActionTaken"),w:"13%",type:"ta"},
    {id:"satisfied",label:t("csvColSatisfied"),w:"8%",minW:90,type:"sel",opts:["Yes","No","Pending","N/A"],transOpts:[t("optSatisfiedYes"),t("optSatisfiedNo"),t("optSatisfiedPending"),t("optSatisfiedNA")]},
    {id:"date_closed",label:t("csvColDateClosed"),w:"6%",minW:80,ph:"DD/MM/YY"},
  ];
  return(<div>
    <InfoBox col={C.purple} bg="#F9F0FF">
      <strong>{t("grievanceTimelinesLabel")}</strong> {t("grievanceTimelinesText")}<br/>
      <strong>{t("grievanceLevelsLabel")}</strong> {t("grievanceLevelsText")}
    </InfoBox>
    <TableBuilder columns={cols} baselineRows={[]} value={rows} onChange={onChange} addRowLabel={t("grievanceAddRow")} minWidth={1150}/>
  </div>);
}

// ═══════════════ TRAINING REGISTER ═══════════════
function TrainingRegister({value,onChange}){
  const {t,lang}=useLang();
  const rows=Array.isArray(value)&&value.length>0?value:(BASELINES_I18N.training[lang]||[]);
  const cols=[
    {id:"date",label:t("csvColDate"),w:"7%",minW:80,ph:"DD/MM/YY"},
    {id:"module",label:t("csvColModule"),w:"18%",ph:"e.g. OHS Induction",type:"ta"},
    {id:"facilitator",label:t("csvColFacilitator"),w:"10%",ph:"Name / Org",type:"ta"},
    {id:"participants",label:t("colParticipantsNo"),w:"7%",minW:60,ph:"#"},
    {id:"target_group",label:t("csvColTargetGroup"),w:"10%",ph:"e.g. Field techs",type:"ta"},
    {id:"duration",label:t("csvColDuration"),w:"7%",minW:75,ph:"hrs/days"},
    {id:"method",label:t("csvColMethod"),w:"12%",minW:140,type:"sel",opts:["In-person","Workshop","On-the-job","Online","Toolbox talk","Certified course","Other"],transOpts:[t("optMethInPerson"),t("optMethWorkshop"),t("optMethOJT"),t("optMethOnline"),t("optMethToolbox"),t("optMethCertified"),t("optMethOther")]},
    {id:"assessment",label:t("csvColAssessment"),w:"8%",minW:90,type:"sel",opts:["Yes","No","Planned"],transOpts:[t("optGenYes"),t("optGenNo"),t("optGenPlanned")]},
    {id:"cert_no",label:t("colCertNo"),w:"8%",ph:"Ref (if any)"},
    {id:"notes",label:t("colNotesGaps"),w:"12%",type:"ta"},
  ];
  return(<div>
    <InfoBox col={C.navyLight} bg="#EBF5FB">{t("trainingInfoBox")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={[]} value={rows} onChange={onChange} addRowLabel={t("trainingAddRow")} minWidth={1050}/>
  </div>);
}

// ═══════════════ STAKEHOLDER REGISTER ═══════════════
// ═══════════════ MULTILINGUAL BASELINES ═══════════════
const BASELINES_I18N = {
  risks: {
    fr:[
      {risk:"Chute de travailleurs depuis les toits lors d'installation ou de maintenance",category:"OHS",prob:"3",sev:"4",mitigation:"Harnais antichute ; formation certifiée travail en hauteur ; système de binôme ; liste de contrôle des échelles",responsible:"",status:"Planned"},
      {risk:"Choc électrique / électrocution par système CC ou CA sous tension",category:"OHS",prob:"2",sev:"4",mitigation:"Procédures LOTO ; outils isolés ; gants EN60903 Classe 1 ; pas de travail électrique seul",responsible:"",status:"Planned"},
      {risk:"Brûlures par acide de batterie plomb-acide ou exposition chimique",category:"OHS",prob:"2",sev:"3",mitigation:"EPI résistant aux acides ; stockage avec rétention ; kit anti-déversement ; formation manipulation sûre",responsible:"",status:"Planned"},
      {risk:"Emballement thermique ou incendie de batterie lithium-ion",category:"OHS",prob:"1",sev:"4",mitigation:"Stockage sûr (température contrôlée) ; emballage ignifugé ; extincteur CO2 ; éviter perforation/écrasement",responsible:"",status:"Planned"},
      {risk:"Accident de véhicule lors du transport terrain",category:"OHS",prob:"3",sev:"3",mitigation:"Formation conducteurs ; géolocalisation ; politique d'heures de conduite maximum ; planning d'entretien véhicules",responsible:"",status:"Planned"},
      {risk:"VBG / Exploitation, abus et harcèlement sexuels (EAS/HS) au travail",category:"Gender/SEAH",prob:"2",sev:"4",mitigation:"Politique de tolérance zéro ; Code de conduite ; canal de signalement confidentiel ; formation ; procédure d'enquête",responsible:"",status:"Planned"},
      {risk:"Élimination inappropriée de batteries plomb-acide causant contamination sol/eau",category:"E-Waste",prob:"3",sev:"4",mitigation:"Programme de reprise ; incitations collecte agents ; partenariat recycleur agréé ; sensibilisation clients",responsible:"",status:"Planned"},
      {risk:"Élimination inappropriée des panneaux solaires en fin de vie",category:"E-Waste",prob:"2",sev:"3",mitigation:"Programme de reprise panneaux ; partenariat recycleur ; conseils élimination clients",responsible:"",status:"Planned"},
      {risk:"Vente abusive de produits à des clients ne pouvant se permettre les paiements",category:"Consumer",prob:"3",sev:"3",mitigation:"Évaluation capacité remboursement ; liste pratiques vente interdites ; formation agents ; enquêtes satisfaction",responsible:"",status:"Planned"},
      {risk:"Produits vendus sans instructions de sécurité adéquates",category:"Consumer",prob:"2",sev:"3",mitigation:"Guide démarrage rapide multilingue ; carte de sécurité dans chaque boîte ; formation agent à la remise client",responsible:"",status:"Planned"},
      {risk:"Travailleurs payés en dessous du salaire minimum ou sans contrats écrits",category:"Labour",prob:"2",sev:"3",mitigation:"Contrats écrits pour tous ; révision salariale par rapport au minimum national ; audit RH",responsible:"",status:"Planned"},
      {risk:"Absence de mécanisme de réclamation accessible aux travailleurs",category:"Labour",prob:"2",sev:"3",mitigation:"Mécanisme de griefs établi ; option anonyme disponible ; politique anti-représailles",responsible:"",status:"Planned"},
      {risk:"Travail des enfants dans la chaîne d'approvisionnement (fabrication panneaux)",category:"Supply Chain",prob:"1",sev:"4",mitigation:"Évaluation E&S fournisseurs ; fournisseurs conformes RBA/OIT prioritaires ; questionnaire de diligence raisonnable",responsible:"",status:"Planned"},
      {risk:"Blessure communautaire par chute d'objets lors d'installation",category:"Community",prob:"2",sev:"3",mitigation:"Barrières de chantier ; accès interdit pendant travaux en toiture ; notification communauté ; inspection post-installation",responsible:"",status:"Planned"},
      {risk:"Violation de données ou utilisation abusive des données personnelles clients",category:"Consumer",prob:"1",sev:"3",mitigation:"Politique de confidentialité ; contrôles d'accès ; minimisation des données ; procédures de consentement client",responsible:"",status:"Planned"},
    ],
    pt:[
      {risk:"Queda de trabalhadores do telhado durante instalação ou manutenção",category:"OHS",prob:"3",sev:"4",mitigation:"Arnês anticaída; formação certificada para trabalho em altura; sistema de parceiro; lista de verificação de escadas",responsible:"",status:"Planned"},
      {risk:"Choque elétrico / eletrocussão por sistema CC ou CA sob tensão",category:"OHS",prob:"2",sev:"4",mitigation:"Procedimentos LOTO; ferramentas isoladas; luvas EN60903 Classe 1; sem trabalho elétrico individual",responsible:"",status:"Planned"},
      {risk:"Queimaduras por ácido de bateria de chumbo-ácido ou exposição química",category:"OHS",prob:"2",sev:"3",mitigation:"EPI resistente a ácidos; armazenamento com dique de contenção; kit anti-derrame; formação em manuseamento seguro",responsible:"",status:"Planned"},
      {risk:"Fuga térmica ou incêndio de bateria de lítio-ião",category:"OHS",prob:"1",sev:"4",mitigation:"Armazenamento seguro (temperatura controlada); embalagem resistente ao fogo; extintor CO2; evitar perfuração/esmagamento",responsible:"",status:"Planned"},
      {risk:"Acidente de viatura durante transporte de campo",category:"OHS",prob:"3",sev:"3",mitigation:"Formação de condutores; rastreamento GPS; política de horas máximas de condução; plano de manutenção de viaturas",responsible:"",status:"Planned"},
      {risk:"VBG / Exploração, abuso e assédio sexual (EAS/AS) no local de trabalho",category:"Gender/SEAH",prob:"2",sev:"4",mitigation:"Política de tolerância zero; Código de Conduta; canal de denúncia confidencial; formação; procedimento de investigação",responsible:"",status:"Planned"},
      {risk:"Eliminação inadequada de baterias de chumbo causando contaminação do solo/água",category:"E-Waste",prob:"3",sev:"4",mitigation:"Programa de recolha; incentivos de recolha por agentes; parceria com reciclador licenciado; educação de clientes",responsible:"",status:"Planned"},
      {risk:"Eliminação inadequada de painéis solares no fim de vida",category:"E-Waste",prob:"2",sev:"3",mitigation:"Programa de recolha de painéis; parceria com reciclador; orientação de eliminação para clientes",responsible:"",status:"Planned"},
      {risk:"Venda abusiva de produtos a clientes que não podem pagar",category:"Consumer",prob:"3",sev:"3",mitigation:"Avaliação de acessibilidade; lista de práticas de venda proibidas; formação de agentes; inquéritos de satisfação",responsible:"",status:"Planned"},
      {risk:"Produtos vendidos sem instruções de segurança adequadas",category:"Consumer",prob:"2",sev:"3",mitigation:"Guia de início rápido multilingue; cartão de segurança em cada caixa; formação do agente na entrega ao cliente",responsible:"",status:"Planned"},
      {risk:"Trabalhadores pagos abaixo do salário mínimo ou sem contratos escritos",category:"Labour",prob:"2",sev:"3",mitigation:"Contratos escritos para todos; revisão salarial face ao mínimo nacional; auditoria de RH",responsible:"",status:"Planned"},
      {risk:"Ausência de mecanismo de reclamação acessível aos trabalhadores",category:"Labour",prob:"2",sev:"3",mitigation:"Mecanismo de queixas estabelecido; opção anónima disponível; política anti-retaliação",responsible:"",status:"Planned"},
      {risk:"Trabalho infantil na cadeia de abastecimento (fabrico de painéis)",category:"Supply Chain",prob:"1",sev:"4",mitigation:"Avaliação A&S de fornecedores; priorizar fornecedores conformes com RBA/OIT; questionário de due diligence",responsible:"",status:"Planned"},
      {risk:"Lesão na comunidade por queda de objetos durante instalação",category:"Community",prob:"2",sev:"3",mitigation:"Barreiras no local; proibição de acesso durante trabalho em telhado; notificação da comunidade; inspeção pós-instalação",responsible:"",status:"Planned"},
      {risk:"Violação de dados ou uso indevido de dados pessoais de clientes",category:"Consumer",prob:"1",sev:"3",mitigation:"Política de privacidade de dados; controlos de acesso; minimização de dados; procedimentos de consentimento do cliente",responsible:"",status:"Planned"},
    ],
  },
  compliance: {
    fr:[
      {law:"Loi travail [Pays]",authority:"Ministère du travail",requirement:"Salaire minimum, horaires, contrats, congés, non-discrimination",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Loi sur les usines / SST [Pays]",authority:"Ministère du travail / Inspection du travail",requirement:"Sécurité au travail, EPI, déclaration d'incidents, inspections",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Loi sur l'environnement [Pays] / Réglementations NESREA",authority:"NESREA / Agence nationale de l'environnement",requirement:"Gestion des déchets, déchets électroniques, prévention de la pollution",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Loi sur la protection des consommateurs",authority:"Conseil de protection des consommateurs",requirement:"Sécurité des produits, tarification équitable, garantie, confidentialité des données",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Loi sur les sociétés [Pays]",authority:"Commission des affaires corporatives",requirement:"Immatriculation de l'entreprise, dépôts annuels",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Exigences de licence NERC",authority:"NERC / Agence d'électrification rurale",requirement:"Licences d'exploitation pour activités électriques au-dessus du seuil",applies:"",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Normes produits VeraSol / IEC",authority:"IEC / GOGLA",requirement:"Normes de qualité et de sécurité des produits (IEC 62509, etc.)",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Convention de Bâle (déchets électroniques)",authority:"Autorité nationale de l'environnement",requirement:"Conformité à la gestion transfrontalière des déchets électroniques",applies:"",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Lois sur les VBG / violences domestiques",authority:"Ministère de la justice / Police",requirement:"Obligations de signalement pour les incidents VBG",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Impôt sur le revenu / PAYE / TVA",authority:"Autorité fiscale fédérale/d'état",requirement:"Conformité fiscale — immatriculation, déclaration, versement",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
    ],
    pt:[
      {law:"Lei do Trabalho [País]",authority:"Ministério do Trabalho",requirement:"Salário mínimo, horários, contratos, licenças, não discriminação",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Lei de Fábricas / SST [País]",authority:"Ministério do Trabalho / Inspeção do Trabalho",requirement:"Segurança no trabalho, EPI, relato de incidentes, inspeções",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Lei Ambiental [País] / Regulamentos NESREA",authority:"NESREA / Agência Nacional do Ambiente",requirement:"Gestão de resíduos, resíduos eletrónicos, prevenção de poluição",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Lei de Defesa do Consumidor",authority:"Conselho de Defesa do Consumidor",requirement:"Segurança do produto, preços justos, garantia, privacidade de dados",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Lei das Sociedades [País]",authority:"Comissão de Assuntos Corporativos",requirement:"Registo da empresa, declarações anuais",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Requisitos de licenciamento NERC",authority:"NERC / Agência de Eletrificação Rural",requirement:"Licenças de operação para atividades elétricas acima do limite",applies:"",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Normas de produto VeraSol / IEC",authority:"IEC / GOGLA",requirement:"Normas de qualidade e segurança de produtos (IEC 62509, etc.)",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Convenção de Basileia (Resíduos Eletrónicos)",authority:"Autoridade Nacional do Ambiente",requirement:"Conformidade na gestão transfronteiriça de resíduos eletrónicos",applies:"",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Leis sobre VBG / Violência Doméstica",authority:"Ministério da Justiça / Polícia",requirement:"Obrigações de reporte de incidentes VBG",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
      {law:"Imposto de Renda / PAYE / IVA",authority:"Autoridade Fiscal Federal/Estadual",requirement:"Conformidade fiscal — registo, declaração, pagamento",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
    ],
  },
  ppe: {
    fr:[
      {task:"Travaux en toiture / en hauteur",hazard:"Chutes de hauteur",ppe_required:"Harnais antichute (EN355), casque (Classe E), chaussures de sécurité antidérapantes, gilet haute visibilité, gants protection UV",standard:"EN355, EN397",provided:"",inspected:"",your_spec:""},
      {task:"Travaux sur systèmes électriques (CC/CA sous tension)",hazard:"Électrocution, arc électrique",ppe_required:"Gants isolants (EN60903 Classe 1 minimum), lunettes de protection, chaussures isolantes, pas de bijoux",standard:"EN60903 Classe 1",provided:"",inspected:"",your_spec:""},
      {task:"Manipulation de batteries plomb-acide",hazard:"Brûlures par acide, gaz toxique, incendie",ppe_required:"Gants résistants aux acides, lunettes de protection, tablier résistant aux produits chimiques, chaussures de sécurité",standard:"EN374",provided:"",inspected:"",your_spec:""},
      {task:"Manipulation / stockage de batteries lithium",hazard:"Emballement thermique, incendie, fumées toxiques",ppe_required:"Gants isolants, lunettes de protection, tablier ignifugé",standard:"—",provided:"",inspected:"",your_spec:""},
      {task:"Entrepôt / chargement / déchargement",hazard:"Manutention manuelle, chutes d'objets",ppe_required:"Chaussures de sécurité (embout acier), gilet haute visibilité, soutien lombaire si manutention lourde",standard:"EN20345",provided:"",inspected:"",your_spec:""},
      {task:"Conduite / transport terrain",hazard:"Accident de la route, fatigue",ppe_required:"Ceinture de sécurité en permanence ; téléphone interdit pendant la conduite",standard:"Code de la route",provided:"",inspected:"",your_spec:""},
      {task:"Travail à distance / en extérieur",hazard:"Chaleur, exposition solaire, faune",ppe_required:"Vêtements solaires de protection, chapeau, crème solaire, eau, répulsif insectes si nécessaire",standard:"—",provided:"",inspected:"",your_spec:""},
      {task:"Bureau / travail général",hazard:"Écran, ergonomie",ppe_required:"Pas d'EPI spécial ; poste de travail ergonomique",standard:"—",provided:"",inspected:"",your_spec:""},
    ],
    pt:[
      {task:"Trabalho em telhado / elevado",hazard:"Queda em altura",ppe_required:"Arnês anticaída (EN355), capacete (Classe E), botas de segurança antiderrapantes, colete refletor, luvas proteção UV",standard:"EN355, EN397",provided:"",inspected:"",your_spec:""},
      {task:"Trabalho em sistemas elétricos (CC/CA sob tensão)",hazard:"Choque elétrico, arco elétrico",ppe_required:"Luvas isolantes (EN60903 Classe 1 mínimo), óculos de proteção, calçado isolante, sem joias",standard:"EN60903 Classe 1",provided:"",inspected:"",your_spec:""},
      {task:"Manuseamento de baterias de chumbo-ácido",hazard:"Queimaduras por ácido, gás tóxico, incêndio",ppe_required:"Luvas resistentes a ácidos, óculos de proteção, avental resistente a produtos químicos, botas de segurança",standard:"EN374",provided:"",inspected:"",your_spec:""},
      {task:"Manuseamento / armazenamento de baterias de lítio",hazard:"Fuga térmica, incêndio, fumos tóxicos",ppe_required:"Luvas isolantes, óculos de proteção, avental resistente ao fogo",standard:"—",provided:"",inspected:"",your_spec:""},
      {task:"Armazém / carga / descarga",hazard:"Manuseamento manual, queda de objetos",ppe_required:"Botas de segurança (biqueira de aço), colete refletor, suporte lombar para cargas pesadas",standard:"EN20345",provided:"",inspected:"",your_spec:""},
      {task:"Condução / transporte de campo",hazard:"Acidente rodoviário, fadiga",ppe_required:"Cinto de segurança sempre; proibido telemóvel durante a condução",standard:"Código da Estrada",provided:"",inspected:"",your_spec:""},
      {task:"Trabalho remoto / ao ar livre",hazard:"Calor, exposição solar, fauna",ppe_required:"Roupa de proteção solar, chapéu, protetor solar, abastecimento de água, repelente de insetos se necessário",standard:"—",provided:"",inspected:"",your_spec:""},
      {task:"Escritório / trabalho geral",hazard:"Monitor, ergonomia",ppe_required:"Sem EPI especial; posto de trabalho ergonómico",standard:"—",provided:"",inspected:"",your_spec:""},
    ],
  },
  stakeholder: {
    fr:[
      {group:"Clients (ménages / entreprises)",interests:"Fiabilité des produits, accessibilité, sécurité, élimination des déchets électroniques",influence:"High",impact:"High",relationship:"Direct",method:"",frequency:"",responsible:""},
      {group:"Employés (toutes catégories)",interests:"Salaires équitables, conditions sûres, sécurité de l'emploi, développement de carrière",influence:"High",impact:"High",relationship:"Direct",method:"",frequency:"",responsible:""},
      {group:"Communautés locales (zones d'installation)",interests:"Sécurité, emploi, impacts environnementaux, déchets électroniques",influence:"Medium",impact:"High",relationship:"Indirect",method:"",frequency:"",responsible:""},
      {group:"Régulateurs (NERC / NESREA / Ministère du travail)",interests:"Conformité, licences, normes produits, droit du travail",influence:"High",impact:"Low",relationship:"Conformité",method:"",frequency:"",responsible:""},
      {group:"Investisseurs / IFD / ROGEAP",interests:"Rendements financiers, conformité SGSE, performance ESG",influence:"High",impact:"Medium",relationship:"Responsabilité",method:"",frequency:"",responsible:""},
      {group:"Fournisseurs / fabricants de produits",interests:"Conditions commerciales, exigences REP, normes qualité",influence:"Medium",impact:"High",relationship:"Chaîne appro.",method:"",frequency:"",responsible:""},
      {group:"Agents commerciaux / distributeurs",interests:"Commission, formation, soutien, protection des consommateurs",influence:"Medium",impact:"High",relationship:"Commercial",method:"",frequency:"",responsible:""},
      {group:"Recycleurs déchets élec. / prestataires",interests:"Volume d'activité, conformité, manutention sûre",influence:"Low",impact:"High",relationship:"Partenariat",method:"",frequency:"",responsible:""},
      {group:"ONG / partenaires de développement",interests:"Impact communautaire, équité de genre, résultats environnementaux",influence:"Low",impact:"Low",relationship:"Parties prenantes",method:"",frequency:"",responsible:""},
      {group:"Organisations sectorielles (GOGLA / NAFSMA)",interests:"Normes sectorielles, plaidoyer, conformité au code",influence:"Low",impact:"Low",relationship:"Pairs",method:"",frequency:"",responsible:""},
    ],
    pt:[
      {group:"Clientes (domésticos / empresas)",interests:"Fiabilidade dos produtos, acessibilidade, segurança, eliminação de resíduos eletrónicos",influence:"High",impact:"High",relationship:"Direto",method:"",frequency:"",responsible:""},
      {group:"Trabalhadores (todas as categorias)",interests:"Salários justos, condições seguras, segurança no emprego, desenvolvimento de carreira",influence:"High",impact:"High",relationship:"Direto",method:"",frequency:"",responsible:""},
      {group:"Comunidades locais (zonas de instalação)",interests:"Segurança, emprego, impactos ambientais, resíduos eletrónicos",influence:"Medium",impact:"High",relationship:"Indireto",method:"",frequency:"",responsible:""},
      {group:"Reguladores (NERC / NESREA / Min. Trabalho)",interests:"Conformidade, licenciamento, normas de produto, legislação laboral",influence:"High",impact:"Low",relationship:"Conformidade",method:"",frequency:"",responsible:""},
      {group:"Investidores / IFD / ROGEAP",interests:"Retornos financeiros, conformidade SGAS, desempenho ASG",influence:"High",impact:"Medium",relationship:"Prestação de contas",method:"",frequency:"",responsible:""},
      {group:"Fornecedores / fabricantes de produtos",interests:"Condições comerciais, requisitos REP, normas de qualidade",influence:"Medium",impact:"High",relationship:"Cadeia de fornecimento",method:"",frequency:"",responsible:""},
      {group:"Agentes de vendas / distribuidores",interests:"Comissão, formação, suporte, proteção ao consumidor",influence:"Medium",impact:"High",relationship:"Comercial",method:"",frequency:"",responsible:""},
      {group:"Recicladores resíd. elec. / prestadores",interests:"Volume de negócio, conformidade, manuseamento seguro",influence:"Low",impact:"High",relationship:"Parceria",method:"",frequency:"",responsible:""},
      {group:"ONG / parceiros de desenvolvimento",interests:"Impacto comunitário, equidade de género, resultados ambientais",influence:"Low",impact:"Low",relationship:"Partes interessadas",method:"",frequency:"",responsible:""},
      {group:"Organismos sectoriais (GOGLA / NAFSMA)",interests:"Normas sectoriais, defesa, conformidade com código",influence:"Low",impact:"Low",relationship:"Pares",method:"",frequency:"",responsible:""},
    ],
  },
  incident: {
    en:[
      {date:"",type:"Near-Miss",description:"Technician's boot splashed with battery acid during lead-acid battery handling — no injury",location:"Warehouse",persons:"Warehouse technician",cause:"Inadequate PPE: acid-resistant gloves and apron not worn",action:"PPE immediately supplied. Corrective: mandatory PPE protocol and toolbox talk delivered to all warehouse staff.",responsible:"OHS Officer",status:"In Progress"},
      {date:"",type:"Near-Miss",description:"Technician slipped on ladder during rooftop panel installation — caught by safety line; no injury",location:"Customer site",persons:"Field technician",cause:"Ladder not properly secured; wet surface after rain",action:"Ladder inspection checklist implemented; no installation immediately after rain; fall arrest harness now mandatory for all rooftop work.",responsible:"Field Supervisor",status:"In Progress"},
      {date:"",type:"Environmental",description:"Small lead-acid battery acid spill (~2 litres) in battery storage area",location:"Warehouse — battery store",persons:"None injured",cause:"Cracked battery casing: battery arrived damaged from supplier",action:"Neutralised with baking soda; area cleaned; bunded storage trays installed; supplier notified and replacement arranged.",responsible:"OHS Officer",status:"Closed"},
    ],
    fr:[
      {date:"",type:"Near-Miss",description:"La botte d'un technicien a été éclaboussée d'acide de batterie lors de la manipulation — aucun blessé",location:"Entrepôt",persons:"Technicien entrepôt",cause:"EPI inadéquats : gants et tablier résistants aux acides non portés",action:"EPI fournis immédiatement. Correctif : protocole EPI obligatoire et causerie sécurité dispensée à tout le personnel.",responsible:"Responsable SST",status:"In Progress"},
      {date:"",type:"Near-Miss",description:"Technicien glissé sur une échelle lors d'une installation en toiture — rattrapé par la ligne de sécurité ; aucun blessé",location:"Site client",persons:"Technicien terrain",cause:"Échelle mal fixée ; surface mouillée après pluie",action:"Liste de contrôle de l'échelle mise en place ; pas d'installation immédiatement après la pluie ; harnais antichute désormais obligatoire pour tous les travaux en toiture.",responsible:"Superviseur terrain",status:"In Progress"},
      {date:"",type:"Environmental",description:"Petit déversement d'acide de batterie plomb-acide (~2 litres) dans la zone de stockage des batteries",location:"Entrepôt — stockage batteries",persons:"Aucun blessé",cause:"Boîtier de batterie fissuré : batterie arrivée endommagée du fournisseur",action:"Neutralisé au bicarbonate de soude ; zone nettoyée ; bacs de rétention installés ; fournisseur notifié et remplacement organisé.",responsible:"Responsable SST",status:"Closed"},
    ],
    pt:[
      {date:"",type:"Near-Miss",description:"Bota de técnico atingida por ácido de bateria durante manuseamento de bateria de chumbo — sem lesão",location:"Armazém",persons:"Técnico de armazém",cause:"EPI inadequado: luvas e avental resistente a ácidos não estavam a ser usados",action:"EPI fornecido imediatamente. Corretivo: protocolo de EPI obrigatório e sessão de segurança realizada para todo o pessoal de armazém.",responsible:"Responsável SST",status:"In Progress"},
      {date:"",type:"Near-Miss",description:"Técnico escorregou em escada durante instalação de painel no telhado — retido pela linha de segurança; sem lesão",location:"Local do cliente",persons:"Técnico de campo",cause:"Escada não devidamente fixada; superfície molhada após chuva",action:"Lista de verificação de escadas implementada; sem instalação imediatamente após chuva; arnês anticaída agora obrigatório para todos os trabalhos em telhado.",responsible:"Supervisor de campo",status:"In Progress"},
      {date:"",type:"Environmental",description:"Pequeno derrame de ácido de bateria de chumbo-ácido (~2 litros) na área de armazenamento de baterias",location:"Armazém — depósito de baterias",persons:"Sem feridos",cause:"Invólucro da bateria fissurado: bateria chegou danificada do fornecedor",action:"Neutralizado com bicarbonato de sódio; área limpa; tabuleiros de contenção instalados; fornecedor notificado e substituição providenciada.",responsible:"Responsável SST",status:"Closed"},
    ],
  },
  training: {
    en:[
      {date:"",module:"OHS Induction — New Staff",facilitator:"OHS Officer",participants:"4",target_group:"New field technicians",duration:"4 hrs",method:"In-person",assessment:"Yes",cert_no:"",notes:"Covered: hazard awareness, PPE use, incident reporting, electrical safety, LOTO procedures"},
      {date:"",module:"Battery Handling & E-Waste Safety",facilitator:"OHS Officer",participants:"8",target_group:"Warehouse and field staff",duration:"2 hrs",method:"Workshop",assessment:"Yes",cert_no:"",notes:"Practical demo of spill kit; acid-resistant PPE; safe battery storage and licensed disposal route"},
      {date:"",module:"GBV / SEAH Awareness & Code of Conduct",facilitator:"HR Manager",participants:"All staff",target_group:"All staff",duration:"2 hrs",method:"In-person",assessment:"No",cert_no:"",notes:"Annual mandatory session: reporting channel, zero-tolerance policy, survivor support referral"},
      {date:"",module:"Consumer Protection & Responsible Selling",facilitator:"Sales Manager",participants:"12",target_group:"Sales agents and distributors",duration:"3 hrs",method:"Workshop",assessment:"Yes",cert_no:"",notes:"Affordability assessment; prohibited selling practices; product safety communication; GRM referral process"},
    ],
    fr:[
      {date:"",module:"Induction SST — Nouveau personnel",facilitator:"Responsable SST",participants:"4",target_group:"Nouveaux techniciens terrain",duration:"4 h",method:"In-person",assessment:"Yes",cert_no:"",notes:"Couvert : sensibilisation aux risques, utilisation EPI, signalement d'incidents, sécurité électrique, procédures LOTO"},
      {date:"",module:"Manipulation de batteries & Sécurité déchets électroniques",facilitator:"Responsable SST",participants:"8",target_group:"Personnel entrepôt et terrain",duration:"2 h",method:"Workshop",assessment:"Yes",cert_no:"",notes:"Démonstration pratique kit anti-déversement ; EPI résistant aux acides ; stockage sûr et filière d'élimination agréée"},
      {date:"",module:"Sensibilisation VBG / EAS/HS & Code de conduite",facilitator:"Responsable RH",participants:"Tout le personnel",target_group:"Tout le personnel",duration:"2 h",method:"In-person",assessment:"No",cert_no:"",notes:"Session annuelle obligatoire : canal de signalement, politique de tolérance zéro, renvoi vers soutien aux victimes"},
      {date:"",module:"Protection des consommateurs & Vente responsable",facilitator:"Directeur commercial",participants:"12",target_group:"Agents et distributeurs",duration:"3 h",method:"Workshop",assessment:"Yes",cert_no:"",notes:"Évaluation capacité remboursement ; pratiques vente interdites ; communication sécurité produits ; processus de renvoi vers MR"},
    ],
    pt:[
      {date:"",module:"Indução SST — Novo pessoal",facilitator:"Responsável SST",participants:"4",target_group:"Novos técnicos de campo",duration:"4 h",method:"In-person",assessment:"Yes",cert_no:"",notes:"Abrangeu: sensibilização para riscos, uso de EPI, reporte de incidentes, segurança elétrica, procedimentos LOTO"},
      {date:"",module:"Manuseamento de baterias e segurança de resíduos eletrónicos",facilitator:"Responsável SST",participants:"8",target_group:"Pessoal de armazém e campo",duration:"2 h",method:"Workshop",assessment:"Yes",cert_no:"",notes:"Demonstração prática do kit anti-derrame; EPI resistente a ácidos; armazenamento seguro e rota de eliminação licenciada"},
      {date:"",module:"Sensibilização VBG / EAS/AS e Código de Conduta",facilitator:"Gestor de RH",participants:"Todo o pessoal",target_group:"Todo o pessoal",duration:"2 h",method:"In-person",assessment:"No",cert_no:"",notes:"Sessão anual obrigatória: canal de denúncia, política de tolerância zero, encaminhamento para apoio a sobreviventes"},
      {date:"",module:"Proteção do consumidor e venda responsável",facilitator:"Diretor comercial",participants:"12",target_group:"Agentes e distribuidores",duration:"3 h",method:"Workshop",assessment:"Yes",cert_no:"",notes:"Avaliação de acessibilidade; práticas de venda proibidas; comunicação de segurança do produto; processo de encaminhamento para MR"},
    ],
  },
  grievance: {
    en:[
      {case_id:"GRM-001",date_received:"",channel:"Phone/WhatsApp",complainant:"Customer (anonymous)",category:"Consumer protection",description:"Customer reports PAYG system locked early — payment received but unit did not unlock",level:"Level 1",assigned_to:"Customer Support",action:"Investigated — confirmed technical error in PAYG platform; unit unlocked immediately; apology issued; platform bug reported to manufacturer.",satisfied:"Yes",date_closed:""},
      {case_id:"GRM-002",date_received:"",channel:"In-person",complainant:"Community member",category:"Community",description:"Community member reports construction noise from warehouse extension disturbing residents during early morning hours",level:"Level 1",assigned_to:"Operations Manager",action:"Agreed to restrict construction to 8am–5pm; contractor notified; community notice posted.",satisfied:"Yes",date_closed:""},
      {case_id:"GRM-003",date_received:"",channel:"Anonymous",complainant:"Anonymous",category:"Working conditions",description:"Anonymous complaint: field technicians pressured to meet sales targets by visiting unsafe sites after dark",level:"Level 2",assigned_to:"HR Manager",action:"HR investigation initiated; sales manager reminded of safe site-visit policy; additional safety briefing for field team.",satisfied:"Pending",date_closed:""},
    ],
    fr:[
      {case_id:"MR-001",date_received:"",channel:"Phone/WhatsApp",complainant:"Client (anonyme)",category:"Consumer protection",description:"Client signale que le système PAYG s'est verrouillé prématurément — paiement reçu mais unité non déverrouillée",level:"Level 1",assigned_to:"Support client",action:"Enquête — erreur technique confirmée sur la plateforme PAYG ; unité déverrouillée immédiatement ; excuses présentées ; bug signalé au fabricant.",satisfied:"Yes",date_closed:""},
      {case_id:"MR-002",date_received:"",channel:"In-person",complainant:"Membre de la communauté",category:"Community",description:"Un membre de la communauté signale que le bruit de construction de l'extension d'entrepôt perturbe les riverains tôt le matin",level:"Level 1",assigned_to:"Directeur des opérations",action:"Accord de restreindre les travaux à 8h–17h ; entrepreneur notifié ; avis communautaire affiché.",satisfied:"Yes",date_closed:""},
      {case_id:"MR-003",date_received:"",channel:"Anonymous",complainant:"Anonyme",category:"Working conditions",description:"Plainte anonyme : techniciens terrain contraints d'atteindre des objectifs de vente en visitant des sites non sécurisés de nuit",level:"Level 2",assigned_to:"Responsable RH",action:"Enquête RH initiée ; responsable commercial rappelé sur la politique de sécurité ; réunion de sécurité supplémentaire pour l'équipe terrain.",satisfied:"Pending",date_closed:""},
    ],
    pt:[
      {case_id:"MR-001",date_received:"",channel:"Phone/WhatsApp",complainant:"Cliente (anónimo)",category:"Consumer protection",description:"Cliente reporta que o sistema PAYG bloqueou antecipadamente — pagamento recebido mas unidade não desbloqueou",level:"Level 1",assigned_to:"Suporte ao cliente",action:"Investigado — erro técnico confirmado na plataforma PAYG; unidade desbloqueada imediatamente; pedido de desculpas emitido; bug reportado ao fabricante.",satisfied:"Yes",date_closed:""},
      {case_id:"MR-002",date_received:"",channel:"In-person",complainant:"Membro da comunidade",category:"Community",description:"Membro da comunidade reporta que o ruído de construção da extensão do armazém perturba residentes de manhã cedo",level:"Level 1",assigned_to:"Gestor de Operações",action:"Acordado restringir obras às 8h–17h; empreiteiro notificado; aviso à comunidade afixado.",satisfied:"Yes",date_closed:""},
      {case_id:"MR-003",date_received:"",channel:"Anonymous",complainant:"Anónimo",category:"Working conditions",description:"Queixa anónima: técnicos de campo pressionados a cumprir metas de vendas visitando locais não seguros de noite",level:"Level 2",assigned_to:"Gestor de RH",action:"Investigação de RH iniciada; gestor de vendas relembrado da política de segurança; briefing adicional de segurança para a equipa de campo.",satisfied:"Pending",date_closed:""},
    ],
  },
};

const STAKEHOLDER_BASELINE=[
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
function StakeholderRegister({value,onChange}){
  const {t,lang}=useLang();
  const rows=Array.isArray(value)&&value.length>0?value:(BASELINES_I18N.stakeholder[lang]||STAKEHOLDER_BASELINE);
  const cols=[
    {id:"group",label:t("csvColGroup"),w:"16%",ph:"Group name",type:"ta"},
    {id:"interests",label:t("csvColInterests"),w:"18%",type:"ta"},
    {id:"influence",label:t("csvColInfluence"),w:"8%",minW:95,type:"sel",opts:["High","Medium","Low"],transOpts:[t("optInflHigh"),t("optInflMedium"),t("optInflLow")]},
    {id:"impact",label:t("colImpactThem"),w:"8%",minW:95,type:"sel",opts:["High","Medium","Low"],transOpts:[t("optInflHigh"),t("optInflMedium"),t("optInflLow")]},
    {id:"relationship",label:t("csvColRelationship"),w:"9%",ph:"Type",type:"ta"},
    {id:"method",label:t("colEngagementMethod"),w:"14%",type:"ta"},
    {id:"frequency",label:t("csvColFrequency"),w:"10%",minW:110,type:"sel",opts:["Ongoing","Monthly","Quarterly","Annually","As needed"],transOpts:[t("optFreqOngoing"),t("optFreqMonthly"),t("optFreqQuarterly"),t("optFreqAnnually"),t("optFreqAsNeeded")]},
    {id:"responsible",label:t("colResponsible"),w:"9%",ph:"Name"},
    {id:"last_engaged",label:t("colLastInspected"),w:"7%",minW:80,ph:"DD/MM/YY"},
  ];
  return(<div>
    <InfoBox col={C.purple} bg="#F9F0FF">{t("stakeholderInfoBox2")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={BASELINES_I18N.stakeholder[lang]||STAKEHOLDER_BASELINE} value={rows} onChange={onChange} addRowLabel={t("stakeholderAddRow")} minWidth={1000}/>
  </div>);
}

// ═══════════════ PPE MATRIX ═══════════════
const PPE_BASELINE=[
  {task:"Rooftop / elevated installation work",hazard:"Falls from height",ppe_required:"Fall arrest harness (EN355), hard hat (Class E), non-slip safety boots, hi-vis vest, UV-protection gloves",standard:"EN355, EN397",provided:"",inspected:"",your_spec:""},
  {task:"Electrical system work (live DC/AC)",hazard:"Electric shock, arc flash",ppe_required:"Insulated gloves (EN60903 Class 1 minimum), safety goggles, insulated footwear, no jewellery",standard:"EN60903 Class 1",provided:"",inspected:"",your_spec:""},
  {task:"Lead-acid battery handling",hazard:"Acid burns, toxic gas, fire",ppe_required:"Acid-resistant gloves, safety goggles, chemical-resistant apron, safety boots",standard:"EN374",provided:"",inspected:"",your_spec:""},
  {task:"Lithium battery handling / storage",hazard:"Thermal runaway, fire, toxic fumes",ppe_required:"Insulated gloves, safety goggles, fire-resistant apron",standard:"—",provided:"",inspected:"",your_spec:""},
  {task:"Warehouse / loading / unloading",hazard:"Manual handling, falling objects",ppe_required:"Safety boots (steel-toed), hi-vis vest, back support if heavy lifting",standard:"EN20345",provided:"",inspected:"",your_spec:""},
  {task:"Driving / field transportation",hazard:"Road accident, fatigue",ppe_required:"Seatbelt at all times; no mobile phone while driving",standard:"Road traffic law",provided:"",inspected:"",your_spec:""},
  {task:"Remote / outdoor work",hazard:"Heat, sun exposure, wildlife",ppe_required:"Sun-protective clothing, hat, sunscreen, water supply, insect repellent where applicable",standard:"—",provided:"",inspected:"",your_spec:""},
  {task:"Office / general work",hazard:"DSE, ergonomic",ppe_required:"No special PPE; ergonomic workstation",standard:"—",provided:"",inspected:"",your_spec:""},
];
function PPEMatrix({value,onChange}){
  const {t,lang}=useLang();
  const rows=Array.isArray(value)&&value.length>0?value:(BASELINES_I18N.ppe[lang]||PPE_BASELINE);
  const cols=[
    {id:"task",label:t("ppeColTask"),w:"15%",ph:"Describe task",type:"ta"},
    {id:"hazard",label:t("ppeColHazard"),w:"13%",ph:"Main hazard",type:"ta"},
    {id:"ppe_required",label:t("ppeColRequired"),w:"23%",type:"ta"},
    {id:"standard",label:t("ppeColStandard"),w:"8%",ph:"EN/ISO ref"},
    {id:"provided",label:t("ppeColProvided"),w:"9%",minW:100,type:"sel",opts:["Yes","No","Partial","Planned"],transOpts:[t("optPpeYes"),t("optPpeNo"),t("optPpePartial"),t("optPpePlanned")]},
    {id:"inspected",label:t("colLastInspected"),w:"7%",minW:80,ph:"DD/MM/YY"},
    {id:"your_spec",label:t("ppeColSpec"),w:"19%",type:"ta"},
  ];
  return(<div>
    <InfoBox col={C.red} bg="#FFF5F5">{t("ppeInfoBox")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={BASELINES_I18N.ppe[lang]||PPE_BASELINE} value={rows} onChange={onChange} addRowLabel={t("ppeAddRow")} minWidth={950}/>
  </div>);
}

// ═══════════════ COMPLIANCE TRACKER ═══════════════
const COMPLIANCE_BASELINE=[
  {law:"[Country] Labour Act",authority:"Ministry of Labour",requirement:"Minimum wage, working hours, contracts, leave, non-discrimination",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
  {law:"[Country] Factories / OHS Act",authority:"Ministry of Labour / Factory Inspectorate",requirement:"Workplace safety, PPE, incident reporting, inspections",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
  {law:"[Country] Environmental Act / NESREA Regulations",authority:"NESREA / National EPA",requirement:"Waste management, e-waste, pollution prevention",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
  {law:"Consumer Protection Law",authority:"Consumer Protection Council",requirement:"Product safety, fair pricing, warranty, data privacy",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
  {law:"[Country] Companies Act",authority:"Corporate Affairs Commission",requirement:"Company registration, annual filings",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
  {law:"NERC Licensing Requirements",authority:"NERC / Rural Electrification Agency",requirement:"Operating licences for power activities above threshold",applies:"",status:"",expiry:"",responsible:"",evidence:"",action:""},
  {law:"VeraSol / IEC Product Standards",authority:"IEC / GOGLA",requirement:"Product quality and safety standards (IEC 62509, etc.)",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
  {law:"Basel Convention (E-Waste)",authority:"National Environment Authority",requirement:"Cross-border e-waste management compliance",applies:"",status:"",expiry:"",responsible:"",evidence:"",action:""},
  {law:"Gender-Based Violence / Domestic Violence Laws",authority:"Ministry of Justice / Police",requirement:"Reporting obligations for GBV incidents",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
  {law:"Income Tax / PAYE / VAT Obligations",authority:"Federal/State Revenue Authority",requirement:"Tax compliance — registration, filing, remittance",applies:"yes",status:"",expiry:"",responsible:"",evidence:"",action:""},
];
function ComplianceTracker({value,onChange}){
  const {t,lang}=useLang();
  const rows=Array.isArray(value)&&value.length>0?value:(BASELINES_I18N.compliance[lang]||COMPLIANCE_BASELINE);
  const cols=[
    {id:"law",label:t("complianceColLaw"),w:"15%",ph:"Name",type:"ta"},
    {id:"authority",label:t("complianceColAuthority"),w:"11%",ph:"Body",type:"ta"},
    {id:"requirement",label:t("complianceColReq"),w:"17%",type:"ta"},
    {id:"applies",label:t("complianceColApplies"),w:"8%",minW:90,type:"sel",opts:["yes","no","unsure"],transOpts:[t("optAppliesYes"),t("optAppliesNo"),t("optAppliesUnsure")]},
    {id:"status",label:t("complianceColStatus"),w:"12%",minW:140,type:"sel",opts:["Compliant","Partial","Non-compliant","Under review","N/A"],transOpts:[t("optComplCompliant"),t("optComplPartial"),t("optComplNonCompliant"),t("optComplReview"),t("optComplNA")]},
    {id:"expiry",label:t("complianceColExpiry"),w:"7%",minW:80,ph:"DD/MM/YY"},
    {id:"responsible",label:t("complianceColResponsible"),w:"8%",ph:"Name"},
    {id:"evidence",label:t("complianceColEvidence"),w:"13%",ph:"File name/location",type:"ta"},
    {id:"action",label:t("complianceColAction"),w:"11%",type:"ta"},
  ];
  return(<div>
    <InfoBox col={C.amber} bg="#FFF8ED">{t("complianceInfoBox")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={BASELINES_I18N.compliance[lang]||COMPLIANCE_BASELINE} value={rows} onChange={onChange} addRowLabel={t("complianceAdd")} minWidth={1150}/>
  </div>);
}

// ═══════════════ SCREENING QUESTIONNAIRE ═══════════════
// Directly from ROGEAP Table 6
function ScreeningQuestionnaire({value,onChange}){
  const {t}=useLang();
  const sections=[
    {id:"excl",title:t("screeningC1"),subtitle:t("screeningC1sub"),items:[
      {id:"forced_labour",lk:"sqForcedLabour",critical:true},
      {id:"child_labour",lk:"sqChildLabour",critical:true},
      {id:"ewaste_noncompliant",lk:"sqEwasteNonCompliant",critical:true},
      {id:"ohs_incidents",lk:"sqOhsIncidents",critical:true},
      {id:"gbv_cases",lk:"sqGbvCases",critical:true},
      {id:"discrimination",lk:"sqDiscrimination",critical:true},
    ]},
    {id:"esms",title:t("screeningC2"),subtitle:t("screeningC2sub"),items:[
      {id:"has_es_policy",lk:"sqHasEsPolicy"},
      {id:"es_training",lk:"sqEsTraining"},
      {id:"hr_policy",lk:"sqHrPolicy"},
      {id:"hr_labour_laws",lk:"sqHrLabourLaws"},
      {id:"hr_nondiscrim",lk:"sqHrNonDiscrim"},
      {id:"hr_no_child",lk:"sqHrNoChild"},
      {id:"hr_no_forced",lk:"sqHrNoForced"},
      {id:"worker_grievance",lk:"sqWorkerGrievance"},
    ]},
    {id:"ohs",title:t("screeningC3"),items:[
      {id:"ohs_policy",lk:"sqOhsPolicy"},
      {id:"ohs_officer",lk:"sqOhsOfficer"},
      {id:"ppe_provided",lk:"sqPpeProvided"},
      {id:"ohs_training",lk:"sqOhsTraining"},
      {id:"incident_system",lk:"sqIncidentSystem"},
      {id:"code_of_conduct",lk:"sqCodeOfConduct"},
      {id:"gbv_training",lk:"sqGbvTraining"},
      {id:"ohs_monitoring",lk:"sqOhsMonitoring"},
    ]},
    {id:"ewaste",title:t("screeningC4"),items:[
      {id:"battery_collection",lk:"sqBatteryCollection"},
      {id:"battery_recycling",lk:"sqBatteryRecycling"},
      {id:"buyback",lk:"sqBuyback"},
      {id:"systematic_collection",lk:"sqSystematicCollection"},
      {id:"ewaste_education",lk:"sqEwasteEducation"},
    ]},
    {id:"stakeholders",title:t("screeningC5"),items:[
      {id:"sep_exists",lk:"sqSepExists"},
      {id:"public_education",lk:"sqPublicEducation"},
      {id:"stakeholders_identified",lk:"sqStakeholdersIdentified"},
      {id:"stakeholder_events",lk:"sqStakeholderEvents"},
      {id:"grievance_written",lk:"sqGrievanceWritten"},
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
              <div style={{fontSize:13,lineHeight:1.5}}>{item.critical&&<span style={{fontSize:10,color:C.red,fontWeight:700,marginRight:6}}>{t("screeningExclusion")}</span>}{t(item.lk)}</div>
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
  const {t}=useLang();
  const d=value||{};
  const set=(k,v)=>onChange({...d,[k]:v});
  const YN=({id,label})=>(
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"#FAFBFC",borderRadius:8,marginBottom:6,border:`1px solid ${C.border}`}}>
      <div style={{flex:1,fontSize:13}}>{label}</div>
      <div style={{display:"flex",gap:5}}>
        {[["Yes",t("mfBtnYes")],["No",t("mfBtnNo")]].map(([val,lbl])=>(
          <button key={val} onClick={()=>set(`${id}_yn`,val)} style={{background:d[`${id}_yn`]===val?(val==="Yes"?"#E8F5E9":"#FDECEA"):"white",color:d[`${id}_yn`]===val?(val==="Yes"?C.green:C.red):C.muted,border:`1px solid ${d[`${id}_yn`]===val?(val==="Yes"?C.green:C.red):C.border}`,borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:F.b}}>{lbl}</button>
        ))}
      </div>
      {d[`${id}_yn`]==="Yes"&&<textarea value={d[`${id}_details`]||""} onChange={e=>set(`${id}_details`,e.target.value)} placeholder={t("mfPhDetails")} rows={3} style={{...S.ta,fontSize:13}}/>}
    </div>
  );
  return(<div>
    <InfoBox col={C.navy} bg="#EBF5FB">{t("mfInfoBox")}</InfoBox>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:12,fontFamily:F.d}}>{t("mfSecHeader")}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[["company",t("mfFldCompany")],["completed_by",t("mfFldCompletedBy")],["position",t("mfFldPosition")],["period_from",t("mfFldPeriodFrom")],["period_to",t("mfFldPeriodTo")],["date",t("mfFldDate")]].map(([k,l])=>(
          <div key={k}><Lbl c={l}/><input value={d[k]||""} onChange={e=>set(k,e.target.value)} style={S.inp}/></div>
        ))}
      </div>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:12,fontFamily:F.d}}>{t("mfSecESMS")}</div>
      <YN id="esms_developed" label={t("mfQEsmsDeveloped")}/>
      <YN id="esms_updated" label={t("mfQEsmsUpdated")}/>
      <YN id="roles_defined" label={t("mfQRolesDefined")}/>
      <div style={{marginTop:8}}>
        <Lbl c={t("mfLblFocalPoint")}/>
        <input value={d.esms_focal||""} onChange={e=>set("esms_focal",e.target.value)} placeholder={t("mfPhFocalPoint")} style={S.inp}/>
      </div>
      <div style={{marginTop:8}}>
        <Lbl c={t("mfLblEsmsStaff")}/>
        <textarea value={d.esms_staff||""} onChange={e=>set("esms_staff",e.target.value)} rows={2} style={S.ta}/>
      </div>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:12,fontFamily:F.d}}>{t("mfSecPolicies")}</div>
      <YN id="es_policy_updated" label={t("mfQEsPolicyUpdated")}/>
      <YN id="hr_policy_updated" label={t("mfQHrPolicyUpdated")}/>
      <YN id="ohs_updated" label={t("mfQOhsUpdated")}/>
      <YN id="sep_updated" label={t("mfQSepUpdated")}/>
      <YN id="gm_updated" label={t("mfQGmUpdated")}/>
      <YN id="esap_progress" label={t("mfQEsapProgress")}/>
      <div style={{marginTop:8}}>
        <Lbl c={t("mfLblEsapConstraints")}/>
        <textarea value={d.esap_constraints||""} onChange={e=>set("esap_constraints",e.target.value)} rows={3} style={S.ta}/>
      </div>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:12,fontFamily:F.d}}>{t("mfSecCapacity")}</div>
      <YN id="training_conducted" label={t("mfQTrainingConducted")}/>
      <div style={{marginTop:8}}>
        <Lbl c={t("mfLblTrainingDetail")}/>
        <textarea value={d.training_detail||""} onChange={e=>set("training_detail",e.target.value)} rows={3} style={S.ta}/>
      </div>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:12,fontFamily:F.d}}>{t("mfSecMonitoring")}</div>
      <YN id="monitoring_plan" label={t("mfQMonitoringPlan")}/>
      <YN id="incidents" label={t("mfQIncidents")}/>
      <YN id="grievances" label={t("mfQGrievances")}/>
      <YN id="seah_complaints" label={t("mfQSeahComplaints")}/>
      <YN id="gm_external" label={t("mfQGmExternal")}/>
      <div style={{marginTop:8}}>
        <Lbl c={t("mfLblKpiSummary")}/>
        <textarea value={d.kpi_summary||""} onChange={e=>set("kpi_summary",e.target.value)} placeholder={t("mfPhKpiSummary")} rows={3} style={S.ta}/>
      </div>
    </div>
    <div style={{...S.card}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:12,fontFamily:F.d}}>{t("mfSecReporting")}</div>
      <YN id="internal_reporting" label={t("mfQInternalReporting")}/>
      <div style={{marginTop:8}}>
        <Lbl c={t("mfLblNextActions")}/>
        <textarea value={d.next_actions||""} onChange={e=>set("next_actions",e.target.value)} rows={3} style={S.ta}/>
      </div>
      <div style={{marginTop:8}}>
        <Lbl c={t("mfLblSignature")}/>
        <input value={d.signature||""} onChange={e=>set("signature",e.target.value)} placeholder={t("mfPhSignature")} style={S.inp}/>
      </div>
    </div>
  </div>);
}

// ═══════════════ SUPPLIER ASSESSMENT ═══════════════
function SupplierAssessment({value,onChange}){
  const {t}=useLang();
  const rows=value||[];
  const cols=[
    {id:"supplier",label:t("supplierColName"),w:"12%",ph:"Company name",type:"ta"},
    {id:"country",label:t("csvColCountry"),w:"7%",ph:"Country"},
    {id:"category",label:t("riskColCategory"),w:"12%",minW:145,type:"sel",opts:["Panels / Modules","Batteries","Accessories","Logistics","Agent/Distributor","Service provider","Other"],transOpts:[t("optSupPanels"),t("optSupBatteries"),t("optSupAccessories"),t("optSupLogistics"),t("optSupAgent"),t("optSupService"),t("optSupOther")]},
    {id:"spend",label:t("csvColSpend"),w:"7%",ph:"USD amount"},
    {id:"es_policy",label:t("csvColESPolicy"),w:"9%",minW:105,type:"sel",opts:["Yes","No","Partial","Unknown"],transOpts:[t("optSupYes"),t("optSupNo"),t("optSupPartial"),t("optSupUnknown")]},
    {id:"child_labour",label:t("csvColChildLabour"),w:"9%",minW:105,type:"sel",opts:["Low","Medium","High","Unknown"],transOpts:[t("optInflLow"),t("optInflMedium"),t("optInflHigh"),t("optSupUnknown")]},
    {id:"forced_labour",label:t("csvColForcedLabour"),w:"9%",minW:105,type:"sel",opts:["Low","Medium","High","Unknown"],transOpts:[t("optInflLow"),t("optInflMedium"),t("optInflHigh"),t("optSupUnknown")]},
    {id:"ewaste",label:t("csvColEwaste"),w:"9%",minW:105,type:"sel",opts:["Yes","No","Partial","Unknown"],transOpts:[t("optSupYes"),t("optSupNo"),t("optSupPartial"),t("optSupUnknown")]},
    {id:"certified",label:t("csvColCertified"),w:"7%",ph:"e.g. RBA, ISO",type:"ta"},
    {id:"last_review",label:t("csvColLastReview"),w:"6%",minW:80,ph:"DD/MM/YY"},
    {id:"action",label:t("complianceColAction"),w:"13%",type:"ta"},
  ];
  return(<div>
    <InfoBox col={C.orange} bg="#FFF3E0">{t("supplierInfoBox")}</InfoBox>
    <TableBuilder columns={cols} baselineRows={[]} value={rows} onChange={onChange} addRowLabel={t("supplierAddBtn")} minWidth={1200}/>
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
  const categories=[
    {val:"ESMS / Policy",lk:"esapCatPolicy"},
    {val:"Labour & Working Conditions",lk:"esapCatLabour"},
    {val:"OHS",lk:"esapCatOhs"},
    {val:"E-Waste Management",lk:"esapCatEwaste"},
    {val:"Consumer/End User Health & Safety",lk:"esapCatConsumer"},
    {val:"Stakeholder Engagement & GRM",lk:"esapCatSep"},
    {val:"Gender / SEAH",lk:"esapCatGender"},
    {val:"HR Management",lk:"esapCatHr"},
    {val:"Compliance",lk:"esapCatCompliance"},
    {val:"Capacity & Training",lk:"esapCatCapacity"},
    {val:"Other",lk:"esapCatOther"},
  ];
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
              {categories.map(c=><option key={c.val} value={c.val}>{t(c.lk)}</option>)}
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
    {rows.length>0&&(
      <div style={{textAlign:"center",margin:"4px 0 24px"}}>
        <button onClick={add} style={{...S.btn,padding:"10px 28px",fontSize:14}}>➕ {t("esapAdd")}</button>
        <div style={{fontSize:11,color:C.muted,marginTop:6}}>{t("esapAutoSaved")}</div>
      </div>
    )}
    {rows.length>0&&(
      <div style={{...S.card,marginTop:8}}>
        <div style={{fontWeight:700,color:C.navy,fontSize:15,marginBottom:14,fontFamily:F.d}}>📊 {t("esapOverviewTitle")}</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:C.navy,color:"white"}}>
                {[["#","5%"],[t("esapCategory"),"14%"],[t("esapObjective"),"22%"],[t("esapKpi"),"12%"],[t("esapDeadline"),"9%"],[t("esapResponsible"),"12%"],[t("esapBudget"),"9%"],["Status","10%"]].map(([h,w])=>(
                  <th key={h} style={{padding:"7px 8px",textAlign:"left",fontWeight:700,width:w,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row,i)=>{
                const st=STATUS[row.status]||STATUS["Not Started"];
                const catObj=categories.find(c=>c.val===row.cat);
                return(
                  <tr key={row.id||i} style={{background:i%2===0?"white":"#F8FAFC",borderBottom:`1px solid ${C.border}`}}>
                    <td style={{padding:"6px 8px",fontWeight:700,color:C.navy}}>{i+1}</td>
                    <td style={{padding:"6px 8px",fontWeight:600,color:C.navy}}>{catObj?t(catObj.lk):row.cat}</td>
                    <td style={{padding:"6px 8px",color:C.text,lineHeight:1.4}}>{row.objective||<span style={{color:C.muted,fontStyle:"italic"}}>—</span>}</td>
                    <td style={{padding:"6px 8px",color:C.muted}}>{row.kpi||"—"}</td>
                    <td style={{padding:"6px 8px",color:C.muted,whiteSpace:"nowrap"}}>{row.deadline||"—"}</td>
                    <td style={{padding:"6px 8px",color:C.muted}}>{row.responsible||"—"}</td>
                    <td style={{padding:"6px 8px",color:C.muted}}>{row.budget||"—"}</td>
                    <td style={{padding:"6px 8px"}}>
                      <span style={{background:st.bg,color:st.c,borderRadius:5,padding:"2px 8px",fontWeight:700,fontSize:11,whiteSpace:"nowrap"}}>{t(st.lk)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>);
}

// ═══════════════ CODE OF CONDUCT BUILDER ═══════════════
function CodeOfConductBuilder({value,onChange}){
  const {t}=useLang();
  const d=value||{};
  const set=(k,v)=>onChange({...d,[k]:v});
  const BASELINE_ITEMS=[
    {id:"competence",text:t("cocItem1")},
    {id:"comply_laws",text:t("cocItem2")},
    {id:"safe_workplace",text:t("cocItem3")},
    {id:"report_unsafe",text:t("cocItem4")},
    {id:"respect",text:t("cocItem5")},
    {id:"no_discrimination",text:t("cocItem6")},
    {id:"no_seah_harassment",text:t("cocItem7")},
    {id:"no_exploitation",text:t("cocItem8")},
    {id:"no_abuse",text:t("cocItem9")},
    {id:"no_sex_minors",text:t("cocItem10")},
    {id:"complete_training",text:t("cocItem11")},
    {id:"report_violations",text:t("cocItem12")},
    {id:"no_retaliation_coc",text:t("cocItem13")},
    {id:"no_corruption",text:t("cocItem14")},
    {id:"ewaste_responsibility",text:t("cocItem15")},
    {id:"confidentiality",text:t("cocItem16")},
  ];
  return(<div>
    <InfoBox col={C.navyLight} bg="#EBF5FB">{t("cocInfoBox")}</InfoBox>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:4,fontFamily:F.d}}>{t("cocSecCompanyDetails")}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[[`company_name`,t("cocFldCompanyName")],[`effective_date`,t("cocFldEffectiveDate")],[`approved_by`,t("cocFldApprovedBy")]].map(([k,l])=>(
          <div key={k}><Lbl c={l}/><input value={d[k]||""} onChange={e=>set(k,e.target.value)} style={S.inp}/></div>
        ))}
      </div>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:4,fontFamily:F.d}}>{t("cocSecPreamble")}</div>
      <Hint c={t("cocHintPreamble")}/>
      <textarea value={d.preamble||t("cocDefaultPreamble")} onChange={e=>set("preamble",e.target.value)} rows={5} style={S.ta}/>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:8,fontFamily:F.d}}>{t("cocSecRequirements")}</div>
      <Hint c={t("cocHintRequirements")}/>
      <ChecklistBuilder baseline={BASELINE_ITEMS} value={d.items} onChange={v=>set("items",v)}/>
    </div>
    <div style={{...S.card,marginBottom:16}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:4,fontFamily:F.d}}>{t("cocSecConsequences")}</div>
      <textarea value={d.consequences||t("cocDefaultConsequences")} onChange={e=>set("consequences",e.target.value)} rows={6} style={S.ta}/>
    </div>
    <div style={{...S.card}}>
      <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:4,fontFamily:F.d}}>{t("cocSecReporting")}</div>
      <textarea value={d.reporting||t("cocDefaultReporting")} onChange={e=>set("reporting",e.target.value)} rows={6} style={S.ta}/>
      <div style={{marginTop:12,background:"#F8FAFD",borderRadius:8,padding:12}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>{t("cocAckTitle")}</div>
        <div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>{t("cocAckText")}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:8}}>
          {[t("cocSigFullName"),t("cocSigPosition"),t("cocSigSignature"),t("cocSigDate")].map((l,i)=><div key={i} style={{fontSize:12,borderBottom:`1px solid ${C.border}`,paddingBottom:4,color:C.muted}}>{l} _______________________</div>)}
        </div>
      </div>
    </div>
  </div>);
}

// ═══════════════ TOOLS REGISTRY ═══════════════
const TOOLS_REGISTRY = {
  screening: { id:"screening", icon:"📋", lk:"toolLblScreening", dk:"toolDescScreening", color:C.navy, tag:"Assessment", component:"ScreeningQuestionnaire", redirectTo:"screening" },
  risk_matrix: { id:"risk_matrix", icon:"🔍", lk:"toolLblRisk", dk:"toolDescRisk", color:C.red, tag:"Risk Assessment", component:"RiskMatrix", redirectTo:"risks" },
  compliance: { id:"compliance", icon:"⚖️", lk:"toolLblCompliance", dk:"toolDescCompliance", color:C.amber, tag:"Compliance", component:"ComplianceTracker", redirectTo:"compliance" },
  ppe_matrix: { id:"ppe_matrix", icon:"🦺", lk:"toolLblPpe", dk:"toolDescPpe", color:C.red, tag:"OHS", component:"PPEMatrix" },
  incident_log: { id:"incident_log", icon:"🚑", lk:"toolLblIncident", dk:"toolDescIncident", color:C.red, tag:"OHS", component:"IncidentLog" },
  training_register: { id:"training_register", icon:"🎓", lk:"toolLblTraining", dk:"toolDescTraining", color:C.navyLight, tag:"Capacity", component:"TrainingRegister" },
  coc: { id:"coc", icon:"📜", lk:"toolLblCoc", dk:"toolDescCoc", color:C.navyLight, tag:"HR Policy", component:"CodeOfConductBuilder" },
  waste_register: { id:"waste_register", icon:"♻️", lk:"toolLblWaste", dk:"toolDescWaste", color:C.green, tag:"Waste Management", component:"WasteRegister" },
  stakeholder_register: { id:"stakeholder_register", icon:"🤝", lk:"toolLblStakeholder", dk:"toolDescStakeholder", color:C.purple, tag:"SEP", component:"StakeholderRegister" },
  grievance_log: { id:"grievance_log", icon:"📬", lk:"toolLblGrievance", dk:"toolDescGrievance", color:C.purple, tag:"Grievance Mechanism", component:"GrievanceLog" },
  supplier_assessment: { id:"supplier_assessment", icon:"🔗", lk:"toolLblSupplier", dk:"toolDescSupplier", color:C.orange, tag:"Supply Chain", component:"SupplierAssessment" },
  monitoring_form: { id:"monitoring_form", icon:"📊", lk:"toolLblMonitoring", dk:"toolDescMonitoring", color:C.teal, tag:"Monitoring", component:"MonitoringForm" },
  esap: { id:"esap", icon:"📝", lk:"toolLblEsap", dk:"toolDescEsap", color:C.navy, tag:"ESAP", component:"ESAPTable", redirectTo:"esap" },
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
function ToolsSection({ esmsData, setFieldValue, openGuide, setActive }) {
  const {t}=useLang();
  const [activeTool, setActiveTool] = useState(null);

  const TOOL_DATA_KEYS = { risk_matrix:"risk_register", compliance:"compliance_tracker", screening:"screening_q" };
  const getVal = (id) => esmsData[TOOL_DATA_KEYS[id] || `tool_${id}`];
  const setVal = (id, v) => setFieldValue(TOOL_DATA_KEYS[id] || `tool_${id}`, "data", v);

  // Ordered list of tools that open inline (excludes redirect-only tools like risk_matrix, compliance, screening, esap)
  const TOOL_ORDER = Object.values(TOOLS_REGISTRY).filter(tt => !tt.redirectTo).map(tt => tt.id);

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
            sections={
              activeTool==='risk_matrix' ? buildRiskSections(esmsData) :
              activeTool==='compliance' ? buildComplianceSections(esmsData,t) :
              activeTool==='screening' ? buildScreeningSections(esmsData) :
              buildToolSection(activeTool, esmsData, t)
            }
            csvToolId={["risk_matrix","compliance","ppe_matrix","incident_log","waste_register","grievance_log","training_register","stakeholder_register","supplier_assessment","esap"].includes(activeTool) ? activeTool : null}
            csvRows={
              activeTool==='risk_matrix' ? (esmsData.risk_register?.data?.length?esmsData.risk_register.data:BASELINE_RISKS) :
              activeTool==='compliance' ? (esmsData.compliance_tracker?.data?.length?esmsData.compliance_tracker.data:COMPLIANCE_BASELINE) :
              activeTool==='ppe_matrix' ? (esmsData.tool_ppe_matrix?.data?.length?esmsData.tool_ppe_matrix.data:PPE_BASELINE) :
              activeTool==='stakeholder_register' ? (esmsData.tool_stakeholder_register?.data?.length?esmsData.tool_stakeholder_register.data:STAKEHOLDER_BASELINE) :
              undefined
            }
            esmsData={esmsData}
          />
        </div>
        <Comp value={val} onChange={v => setVal(activeTool, v)} />
        {(() => {
          const toolIdx = TOOL_ORDER.indexOf(activeTool);
          if (toolIdx === -1) return null;
          return (
            <div style={{ marginTop:24, paddingTop:16, borderTop:`1.5px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              <div/>
              <div style={{display:"flex",gap:10}}>
                {toolIdx > 0 && <button onClick={() => setActiveTool(TOOL_ORDER[toolIdx-1])} style={S.outBtn}>← {t(TOOLS_REGISTRY[TOOL_ORDER[toolIdx-1]].lk)}</button>}
                {toolIdx < TOOL_ORDER.length-1 && <button onClick={() => setActiveTool(TOOL_ORDER[toolIdx+1])} style={S.btn}>{t(TOOLS_REGISTRY[TOOL_ORDER[toolIdx+1]].lk)} →</button>}
              </div>
            </div>
          );
        })()}
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
                const isRedirect = !!tool.redirectTo;
                const hasData = !isRedirect && !!(getVal(tool.id)?.data);
                const toolLabel = t(tool.lk);
                const toolDesc = t(tool.dk);
                const handleClick = () => isRedirect ? setActive(tool.redirectTo) : setActiveTool(tool.id);
                return (
                  <div key={tool.id} onClick={handleClick}
                    style={{ ...S.card, cursor:"pointer", borderLeft:`4px solid ${tool.color}`, position:"relative", transition:"all 0.15s", borderColor: hasData ? C.green : C.border, borderWidth:"1.5px 1.5px 1.5px 4px", opacity: isRedirect ? 0.88 : 1 }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.opacity = "1"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; e.currentTarget.style.opacity = isRedirect ? "0.88" : "1"; }}>
                    {hasData && <span style={{ position:"absolute", top:10, right:10, fontSize:14 }}>✅</span>}
                    {isRedirect && <span title="Opens in its own section" style={{ position:"absolute", top:10, right:10, fontSize:11, color:C.muted, fontStyle:"italic" }}>↗ section</span>}
                    <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                      <div style={{ fontSize:24, flexShrink:0 }}>{tool.icon}</div>
                      <div>
                        <div style={{ fontWeight:700, color:C.text, fontSize:13, marginBottom:3 }}>{toolLabel}</div>
                        <Tag label={tool.tag} col={tool.color} bg={`${tool.color}15`}/>
                        <div style={{ fontSize:12, color:C.muted, marginTop:5, lineHeight:1.45 }}>{toolDesc.substring(0,85)}…</div>
                      </div>
                    </div>
                    <div style={{ marginTop:10, fontSize:11, color:tool.color, fontWeight:600 }}>
                      {isRedirect ? t("toolsGoToSection") : t("toolsOpen")}
                    </div>
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
function makePolicies(t) {
  return [
    {
      id:"es_policy_stmt", icon:"📜", label:t("policyLblES"), color:C.navy,
      desc:t("policyDescES"),
      fields:[
        {id:"company_name",label:t("pfldCompanyName"),t:"text",req:true},
        {id:"mission",label:t("pfldMission"),t:"ta",rows:3,req:true,ph:t("phMission")},
        {id:"env_commitments",label:t("pfldEnvCommitments"),t:"cbl",items:[
          {id:"ewaste",text:t("envCommit1")},
          {id:"suppliers_env",text:t("envCommit2")},
          {id:"ghg",text:t("envCommit3")},
          {id:"resource",text:t("envCommit4")},
          {id:"ewaste_edu",text:t("envCommit5")},
          {id:"epr",text:t("envCommit6")},
          {id:"comply_env",text:t("envCommit7")},
        ]},
        {id:"social_commitments",label:t("pfldSocialCommitments"),t:"cbl",items:[
          {id:"fair_labour",text:t("socialCommit1")},
          {id:"living_wage",text:t("socialCommit2")},
          {id:"no_child",text:t("socialCommit3")},
          {id:"gender",text:t("socialCommit4")},
          {id:"zero_seah",text:t("socialCommit5")},
          {id:"community",text:t("socialCommit6")},
          {id:"access",text:t("socialCommit7")},
        ]},
        {id:"governance",label:t("pfldGovernance"),t:"cbl",items:[
          {id:"laws",text:t("govCommit1")},
          {id:"ifc",text:t("govCommit2")},
          {id:"gogla",text:t("govCommit3")},
          {id:"abc",text:t("govCommit4")},
          {id:"reporting",text:t("govCommit5")},
          {id:"gm_commit",text:t("govCommit6")},
          {id:"review",text:t("govCommit7")},
        ]},
        {id:"policy_text",label:t("pfldPolicyText"),t:"ta",rows:12,ph:t("phPolicyText")},
        {id:"signatory",label:t("pfldSignatory"),t:"text",ph:t("phSignatoryES")},
        {id:"review_freq",label:t("pfldReviewFreq"),t:"sel",opts:[t("optAnnually"),t("optSixMonthly"),t("optAfterIncident"),t("optNotDetermined")]},
      ]
    },
    {
      id:"hr_policy_stmt", icon:"👥", label:t("policyLblHR"), color:C.navyLight,
      desc:t("policyDescHR"),
      fields:[
        {id:"hr_scope",label:t("pfldHRScope"),t:"ta",rows:2,ph:t("phHRScope")},
        {id:"eeo",label:t("pfldEEO"),t:"cbl",items:[
          {id:"no_race",text:t("eeoItem1")},
          {id:"merit",text:t("eeoItem2")},
          {id:"women_access",text:t("eeoItem3")},
          {id:"minority",text:t("eeoItem4")},
        ]},
        {id:"work_conditions",label:t("pfldWorkConditions"),t:"cbl",items:[
          {id:"contracts",text:t("workCond1")},
          {id:"min_wage",text:t("workCond2")},
          {id:"overtime",text:t("workCond3")},
          {id:"leave",text:t("workCond4")},
          {id:"benefits",text:t("workCond5")},
        ]},
        {id:"rights",label:t("pfldWorkerRights"),t:"cbl",items:[
          {id:"foa",text:t("rights1")},
          {id:"no_forced",text:t("rights2")},
          {id:"no_child_hr",text:t("rights3")},
          {id:"safety",text:t("rights4")},
          {id:"dignity",text:t("rights5")},
        ]},
        {id:"women_hr",label:t("pfldWomenHR"),t:"cbl",items:[
          {id:"sanitary",text:t("womenHR1")},
          {id:"maternity",text:t("womenHR2")},
          {id:"seah_policy",text:t("womenHR3")},
          {id:"career_women",text:t("womenHR4")},
        ]},
        {id:"grievance_hr",label:t("pfldGrievanceHR"),t:"ta",rows:3,ph:t("phGrievanceHR")},
        {id:"hr_signatory",label:t("pfldSignatory"),t:"text",ph:t("phSignatoryHR")},
      ]
    },
    {
      id:"hs_policy_stmt", icon:"⛑️", label:t("policyLblHS"), color:C.red,
      desc:t("policyDescHS"),
      fields:[
        {id:"hs_commitment",label:t("pfldHSCommitment"),t:"ta",rows:4,ph:t("phHSCommitment")},
        {id:"hs_objectives",label:t("pfldHSObjectives"),t:"cbl",items:[
          {id:"zero_fat",text:t("hsObj1")},
          {id:"reduce_lti",text:t("hsObj2")},
          {id:"comply_ohs",text:t("hsObj3")},
          {id:"ppe_ohs",text:t("hsObj4")},
          {id:"inspect",text:t("hsObj5")},
          {id:"investigate",text:t("hsObj6")},
          {id:"committee",text:t("hsObj7")},
          {id:"improve_ohs",text:t("hsObj8")},
        ]},
        {id:"hs_resp",label:t("pfldHSResp"),t:"ta",rows:5,ph:t("phHSResp")},
        {id:"hs_signatory",label:t("pfldSignatory"),t:"text",ph:t("phSignatoryHS")},
      ]
    },
    {
      id:"consumer_policy_stmt", icon:"🛡️", label:t("policyLblConsumer"), color:C.teal,
      desc:t("policyDescConsumer"),
      fields:[
        {id:"cp_statement",label:t("pfldPolicyStatement"),t:"ta",rows:4,ph:t("phCPStatement")},
        {id:"cp_principles",label:t("pfldCPPrinciples"),t:"cbl",items:[
          {id:"transparency_cp",text:t("cpPrin1")},
          {id:"affordability",text:t("cpPrin2")},
          {id:"no_pressure",text:t("cpPrin3")},
          {id:"after_sales",text:t("cpPrin4")},
          {id:"quality_cp",text:t("cpPrin5")},
          {id:"data_privacy_cp",text:t("cpPrin6")},
          {id:"fair_treatment",text:t("cpPrin7")},
          {id:"debt_cp",text:t("cpPrin8")},
          {id:"gogla_cp",text:t("cpPrin9")},
          {id:"disposal_cp",text:t("cpPrin10")},
        ]},
        {id:"cp_signatory",label:t("pfldSignatory"),t:"text",ph:t("phSignatoryCP")},
      ]
    },
    {
      id:"waste_policy_stmt", icon:"♻️", label:t("policyLblWaste"), color:C.green,
      desc:t("policyDescWaste"),
      fields:[
        {id:"waste_statement",label:t("pfldPolicyStatement"),t:"ta",rows:4,ph:t("phWasteStatement")},
        {id:"waste_commitments",label:t("pfldWasteCommitments"),t:"cbl",items:[
          {id:"r5_wmp",text:t("wasteCommit1")},
          {id:"takeback_wmp",text:t("wasteCommit2")},
          {id:"licensed_wmp",text:t("wasteCommit3")},
          {id:"no_dump",text:t("wasteCommit4")},
          {id:"track_wmp",text:t("wasteCommit5")},
          {id:"educate_wmp",text:t("wasteCommit6")},
          {id:"comply_wmp",text:t("wasteCommit7")},
          {id:"informal_wmp",text:t("wasteCommit8")},
        ]},
        {id:"waste_signatory",label:t("pfldSignatory"),t:"text",ph:t("phSignatoryWaste")},
      ]
    },
    {
      id:"gender_policy_stmt", icon:"⚡", label:t("policyLblGender"), color:C.purple,
      desc:t("policyDescGender"),
      fields:[
        {id:"gender_statement",label:t("pfldPolicyStatement"),t:"ta",rows:4,ph:t("phGenderStatement")},
        {id:"gender_commitments",label:t("pfldGenderCommitments"),t:"cbl",items:[
          {id:"zero_seah_g",text:t("genderCommit1")},
          {id:"safe_reporting",text:t("genderCommit2")},
          {id:"workforce_targets",text:t("genderCommit3")},
          {id:"training_gender",text:t("genderCommit4")},
          {id:"female_customers",text:t("genderCommit5")},
          {id:"gender_data",text:t("genderCommit6")},
          {id:"separate_forums",text:t("genderCommit7")},
          {id:"female_agents",text:t("genderCommit8")},
        ]},
        {id:"seah_procedure",label:t("pfldSEAHProcedure"),t:"ta",rows:4,ph:t("phSEAHProcedure")},
        {id:"gender_signatory",label:t("pfldSignatory"),t:"text",ph:t("phSignatoryGender")},
      ]
    },
  ];
}

function PolicySection({ esmsData, setFieldValue, openGuide }) {
  const {t}=useLang();
  const[activePol, setActivePol] = useState(null);
  const policies = makePolicies(t);

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
// ═══════════════ BUSINESS PROFILE — FIELD LABELS (trilingual) ═══════════════
const BP_LABELS = {
  en:{
    companyName:"Company Name",legalForm:"Legal Form",regNumber:"Registration Number",
    sector:"Sector",subSector:"Sub-Sector",headcount:"Number of Employees",
    annualRevenue:"Annual Revenue (approx. USD)",country:"Country",
    state:"State / Province / Region",city:"City",address:"Physical Address",
    operationType:"Operation Type",esmsStage:"ESMS Development Stage",
    primaryESIssues:"Primary E&S Issues (one per line)",workerTypes:"Worker Types (one per line)",
    vulnerableGroups:"Vulnerable Groups Likely Affected",existingCerts:"Existing Certifications (one per line)",
    esgReporting:"ESG Reporting Initiatives (one per line)",
    leadName:"ESMS Focal Point — Name",leadRole:"Role / Title",
    leadEmail:"Email Address",leadPhone:"Phone Number",
    docsAvailable:"ESMS Documents Currently Available?",docsList:"List of Available E&S Documents",
    auditCycle:"Current Audit / Review Cycle",certPlanned:"External Certifications Planned?",
    certPlannedList:"Planned Certifications (one per line)",
    mainActivity:"Main Business Activity Description",keyProcesses:"Key Operational Processes",
    resourceUse:"Resource Use Summary (energy, water, materials)",wasteEmissions:"Waste & Emissions Summary",
    coreFacilities:"Core Facilities / Sites (one per line)",contractorsUsed:"Contractors or Third Parties Used?",
    contractorTypes:"Main Contractor / Sub-Contractor Types (one per line)",keySuppliers:"Key Suppliers",
    highRiskNotes:"High-Risk Supply Chain Notes",
    baselineIndicators:"Baseline Performance Indicators",incidentHistory:"Incident History (last 2–3 years)",
    complianceStatus:"Current Legal Compliance Status",keyGaps:"Key Gaps vs. Local Law (one per line)",
    priorActions:"Prior ESMS Improvement Actions (one per line)",
    targetFinancier:"Target Financier or Client",preferredStandards:"Preferred Standards / Frameworks (one per line)",
    outputFormat:"Preferred Output Format",
    opNew:"New business",opExisting:"Existing business",opExpansion:"Expansion of existing operations",
    stageDraft:"Draft — developing ESMS for the first time",
    stageImplementing:"Implementing — ESMS in place and in active use",
    stageReviewing:"Reviewing — existing ESMS under review or improvement",
    yes:"Yes",no:"No",fmtPdf:"PDF",fmtDocx:"Word (RTF/DOCX)",fmtHtml:"HTML (web)",
  },
  fr:{
    companyName:"Nom de l'entreprise",legalForm:"Forme juridique",regNumber:"Numéro d'enregistrement",
    sector:"Secteur",subSector:"Sous-secteur",headcount:"Nombre d'employés",
    annualRevenue:"Chiffre d'affaires annuel (USD approx.)",country:"Pays",
    state:"État / Province / Région",city:"Ville",address:"Adresse physique",
    operationType:"Type d'opération",esmsStage:"Stade de développement du SGSE",
    primaryESIssues:"Principaux enjeux E&S (un par ligne)",workerTypes:"Types de travailleurs (un par ligne)",
    vulnerableGroups:"Groupes vulnérables susceptibles d'être affectés",existingCerts:"Certifications existantes (une par ligne)",
    esgReporting:"Initiatives de reporting ESG (une par ligne)",
    leadName:"Point focal SGSE — Nom",leadRole:"Rôle / Titre",
    leadEmail:"Adresse e-mail",leadPhone:"Numéro de téléphone",
    docsAvailable:"Documents SGSE actuellement disponibles ?",docsList:"Liste des documents E&S disponibles",
    auditCycle:"Cycle d'audit / révision actuel",certPlanned:"Certifications externes prévues ?",
    certPlannedList:"Certifications prévues (une par ligne)",
    mainActivity:"Description de l'activité principale",keyProcesses:"Processus opérationnels clés",
    resourceUse:"Utilisation des ressources (énergie, eau, matériaux)",wasteEmissions:"Résumé des déchets et émissions",
    coreFacilities:"Installations / Sites principaux (un par ligne)",contractorsUsed:"Sous-traitants ou tiers utilisés ?",
    contractorTypes:"Types de sous-traitants / prestataires (un par ligne)",keySuppliers:"Principaux fournisseurs",
    highRiskNotes:"Notes sur la chaîne d'approvisionnement à risque élevé",
    baselineIndicators:"Indicateurs de performance de référence",incidentHistory:"Historique des incidents (2–3 dernières années)",
    complianceStatus:"Statut actuel de conformité légale",keyGaps:"Lacunes par rapport à la loi locale (une par ligne)",
    priorActions:"Actions d'amélioration SGSE antérieures (une par ligne)",
    targetFinancier:"Financeur ou client cible",preferredStandards:"Normes / Référentiels préférés (un par ligne)",
    outputFormat:"Format de sortie préféré",
    opNew:"Nouvelle entreprise",opExisting:"Entreprise existante",opExpansion:"Expansion des opérations existantes",
    stageDraft:"Ébauche — développement initial du SGSE",
    stageImplementing:"Mise en œuvre — SGSE en place et utilisé",
    stageReviewing:"Révision — SGSE existant en cours de révision",
    yes:"Oui",no:"Non",fmtPdf:"PDF",fmtDocx:"Word (RTF/DOCX)",fmtHtml:"HTML (web)",
  },
  pt:{
    companyName:"Nome da Empresa",legalForm:"Forma Jurídica",regNumber:"Número de Registo",
    sector:"Setor",subSector:"Subsetor",headcount:"Número de Trabalhadores",
    annualRevenue:"Volume de Negócios Anual (USD aprox.)",country:"País",
    state:"Estado / Província / Região",city:"Cidade",address:"Endereço Físico",
    operationType:"Tipo de Operação",esmsStage:"Fase de Desenvolvimento do SGAS",
    primaryESIssues:"Principais Questões A&S (uma por linha)",workerTypes:"Tipos de Trabalhadores (um por linha)",
    vulnerableGroups:"Grupos Vulneráveis Susceptíveis de Serem Afetados",existingCerts:"Certificações Existentes (uma por linha)",
    esgReporting:"Iniciativas de Reporte ESG (uma por linha)",
    leadName:"Ponto Focal do SGAS — Nome",leadRole:"Função / Cargo",
    leadEmail:"Endereço de E-mail",leadPhone:"Número de Telefone",
    docsAvailable:"Documentos SGAS Atualmente Disponíveis?",docsList:"Lista de Documentos A&S Disponíveis",
    auditCycle:"Ciclo de Auditoria / Revisão Atual",certPlanned:"Certificações Externas Previstas?",
    certPlannedList:"Certificações Previstas (uma por linha)",
    mainActivity:"Descrição da Atividade Principal",keyProcesses:"Principais Processos Operacionais",
    resourceUse:"Uso de Recursos (energia, água, materiais)",wasteEmissions:"Resumo de Resíduos e Emissões",
    coreFacilities:"Principais Instalações / Locais (um por linha)",contractorsUsed:"Utiliza Empreiteiros ou Terceiros?",
    contractorTypes:"Tipos de Empreiteiros / Subcontratados (um por linha)",keySuppliers:"Principais Fornecedores",
    highRiskNotes:"Notas sobre Cadeia de Abastecimento de Alto Risco",
    baselineIndicators:"Indicadores de Desempenho de Referência",incidentHistory:"Histórico de Incidentes (últimos 2–3 anos)",
    complianceStatus:"Estado Atual de Conformidade Legal",keyGaps:"Principais Lacunas face à Lei Local (uma por linha)",
    priorActions:"Ações de Melhoria SGAS Anteriores (uma por linha)",
    targetFinancier:"Financiador ou Cliente Alvo",preferredStandards:"Normas / Referenciais Preferidos (um por linha)",
    outputFormat:"Formato de Saída Preferido",
    opNew:"Nova empresa",opExisting:"Empresa existente",opExpansion:"Expansão de operações existentes",
    stageDraft:"Rascunho — desenvolvendo o SGAS pela primeira vez",
    stageImplementing:"Implementação — SGAS estabelecido e em uso",
    stageReviewing:"Revisão — SGAS existente em revisão ou melhoria",
    yes:"Sim",no:"Não",fmtPdf:"PDF",fmtDocx:"Word (RTF/DOCX)",fmtHtml:"HTML (web)",
  },
};

// ═══════════════ BUSINESS PROFILE — SAMPLE DATA (BrightSun Distributors, Nigeria) ═══════════════
const BP_SAMPLE_DATA = {
  bp_companyContext:{
    companyName:"BrightSun Distributors Limited",legalForm:"Private Limited Company (Ltd)",regNumber:"BN 1234567",
    sector:"Renewable Energy",subSector:"Off-Grid Solar Products",headcount:"24",annualRevenue:"350000",
    country:"Nigeria",state:"Federal Capital Territory",city:"Abuja",
    address:"No 12 Solar Avenue, Gwarinpa Estate, Abuja",
    operationType:"opExisting",esmsStage:"stageDraft",
  },
  bp_esProfile:{
    primaryESIssues:"Waste from batteries and damaged solar panels\nSafe handling and transport of solar equipment\nWorker safety during installation on rooftops and in remote areas\nCommunity access to energy and affordability",
    workerTypes:"Permanent technical staff\nSales and logistics staff\nSub-contracted installers (rural partners)",
    vulnerableGroups:"Rural households, women-led households, low-income communities",
    existingCerts:"",
    esgReporting:"Local ESG reporting to microfinance partner\nInternal sustainability dashboard",
  },
  bp_esmsGovernance:{
    leadName:"Amina Bello",leadRole:"Sustainability and Operations Manager",
    leadEmail:"amina.bello@brightsun.ng",leadPhone:"+234 803 123 4567",
    docsAvailable:"no",docsList:"",
    auditCycle:"None yet; planning first internal review for Q3 2026",
    certPlanned:"yes",certPlannedList:"ISO 14001\nClean Energy Distribution Best Practices (national initiative)",
  },
  bp_operationsSupplyChain:{
    mainActivity:"BrightSun Distributors resells and installs off-grid solar products (solar home systems, solar lanterns, and solar-powered water pumps) to rural and peri-urban households and small businesses in Nigeria. We source equipment from international manufacturers, maintain a central warehouse in Abuja, and deliver and install units via a network of trained technicians and local partner agents.",
    keyProcesses:"Procurement → Warehouse handling → Logistics and delivery → On-site installation → Customer training and after-sales support",
    resourceUse:"Electricity for office and showroom (grid and backup generator), moderate water use for staff facilities, paper and digital documents for sales and service records.",
    wasteEmissions:"Dispose of packaging waste, occasional damaged panels or batteries through certified recyclers; minimal direct emissions from office operations.",
    coreFacilities:"Office and showroom – Gwarinpa, Abuja\nWarehouse – Life Camp, Abuja",
    contractorsUsed:"yes",contractorTypes:"Sub-contracted rural solar installers\nTransport and logistics providers",
    keySuppliers:"Solar panel manufacturer – China; Lithium battery supplier – Kenya; Water pump motor supplier – South Africa; National distributor for solar lanterns – Nigeria",
    highRiskNotes:"Battery and inverter components may involve complex supply chains; BrightSun screens suppliers for environmental and social minimum requirements and prefers partners with clear take-back or recycling policies.",
  },
  bp_baselineCompliance:{
    baselineIndicators:"Annual waste: 1.2 tonnes packaging waste; 1 minor incident in 2025 (near-miss fall during rooftop installation); 95% of customer service tickets resolved within 7 days.",
    incidentHistory:"2024: 0 recorded incidents; 2025: 1 near-miss fall from a rooftop during installation (no injury, toolbox talk and ladder training reinforced); 2026 so far: 0 incidents.",
    complianceStatus:"Substantially compliant with local environmental, health, and safety regulations; ongoing alignment with national solar deployment and battery-handling guidelines.",
    keyGaps:"Formalized waste management plan for batteries and e-waste under review\nFormal occupational health and safety training schedule under development",
    priorActions:"Developed basic installation safety checklist and protective equipment policy\nImplemented a tracking system for customer complaints and follow-up visits",
  },
  bp_uiHints:{
    targetFinancier:"IFC-linked financial institution, local ESG-focused bank",
    preferredStandards:"IFC Performance Standards 1–8\nNigerian Solar Energy Access Regulations\nNational E-Waste Management Guidelines",
    outputFormat:"fmtPdf",
  },
};

const NAV_DEFS = [
  { id:"welcome",          icon:"🏠", tKey:"navOverview"                    },
  { id:"business_profile", icon:"🏢", tKey:"navBizProfile", optional:true   },
  { id:"screening",        icon:"📋", tKey:"navScreening"                   },
  { id:"policy",     icon:"📜", tKey:"navPolicies"  },
  { id:"risks",      icon:"🔍", tKey:"navRisks"     },
  { id:"compliance", icon:"⚖️", tKey:"navCompliance"},
  { id:"plans",      icon:"⚙️", tKey:"navPlans"     },
  { id:"tools",      icon:"🛠️", tKey:"navTools"     },
  { id:"esap",       icon:"📝", tKey:"navEsap"      },
];

// ═══════════════ BUSINESS PROFILE — SUB-SECTION DEFINITIONS ═══════════════
const BUSINESS_PROFILE_DEFS = [
  { id:"companyContext",        lk:"bpC1Label", dk:"bpC1Desc", icon:"🏢", color:C.navy,
    fields:[
      {id:"companyName",       type:"text"},
      {id:"legalForm",         type:"text"},
      {id:"regNumber",         type:"text"},
      {id:"sector",            type:"text"},
      {id:"subSector",         type:"text"},
      {id:"headcount",         type:"number"},
      {id:"annualRevenue",     type:"number"},
      {id:"country",           type:"text"},
      {id:"state",             type:"text"},
      {id:"city",              type:"text"},
      {id:"address",           type:"ta",rows:2},
      {id:"operationType",     type:"sel",  opts:["opNew","opExisting","opExpansion"]},
      {id:"esmsStage",         type:"sel",  opts:["stageDraft","stageImplementing","stageReviewing"]},
    ]},
  { id:"esProfile",             lk:"bpC2Label", dk:"bpC2Desc", icon:"🌿", color:C.green,
    fields:[
      {id:"primaryESIssues",   type:"ta",rows:4},
      {id:"workerTypes",       type:"ta",rows:3},
      {id:"vulnerableGroups",  type:"ta",rows:2},
      {id:"existingCerts",     type:"ta",rows:2},
      {id:"esgReporting",      type:"ta",rows:2},
    ]},
  { id:"esmsGovernance",        lk:"bpC3Label", dk:"bpC3Desc", icon:"👤", color:C.navyLight,
    fields:[
      {id:"leadName",          type:"text"},
      {id:"leadRole",          type:"text"},
      {id:"leadEmail",         type:"text"},
      {id:"leadPhone",         type:"text"},
      {id:"docsAvailable",     type:"bool"},
      {id:"docsList",          type:"ta",rows:3},
      {id:"auditCycle",        type:"text"},
      {id:"certPlanned",       type:"bool"},
      {id:"certPlannedList",   type:"ta",rows:2},
    ]},
  { id:"operationsSupplyChain", lk:"bpC4Label", dk:"bpC4Desc", icon:"⚙️", color:C.amber,
    fields:[
      {id:"mainActivity",      type:"ta",rows:4},
      {id:"keyProcesses",      type:"ta",rows:3},
      {id:"resourceUse",       type:"ta",rows:3},
      {id:"wasteEmissions",    type:"ta",rows:3},
      {id:"coreFacilities",    type:"ta",rows:2},
      {id:"contractorsUsed",   type:"bool"},
      {id:"contractorTypes",   type:"ta",rows:2},
      {id:"keySuppliers",      type:"ta",rows:3},
      {id:"highRiskNotes",     type:"ta",rows:3},
    ]},
  { id:"baselineCompliance",    lk:"bpC5Label", dk:"bpC5Desc", icon:"📊", color:C.teal,
    fields:[
      {id:"baselineIndicators",type:"ta",rows:3},
      {id:"incidentHistory",   type:"ta",rows:3},
      {id:"complianceStatus",  type:"text"},
      {id:"keyGaps",           type:"ta",rows:3},
      {id:"priorActions",      type:"ta",rows:3},
    ]},
  { id:"uiHints",               lk:"bpC6Label", dk:"bpC6Desc", icon:"🎯", color:C.muted,
    fields:[
      {id:"targetFinancier",   type:"text"},
      {id:"preferredStandards",type:"ta",rows:3},
      {id:"outputFormat",      type:"sel", opts:["fmtPdf","fmtDocx","fmtHtml"]},
    ]},
];

// ═══════════════ PLAN TABLE BASELINES — FR + PT ═══════════════
const PLAN_TABLE_BASELINES = {
  waste_streams: {
    fr:[
      {waste_type:"Batteries plomb-acide",hazard_class:"Dangereux",source:"Retour clients / collecte agent",volume_yr:"~200",unit:"unités",notes:"Principal flux de déchets électroniques ; classé Convention de Bâle ; priorité maximale"},
      {waste_type:"Batteries lithium-ion",hazard_class:"Dangereux",source:"Retour clients / fin de vie",volume_yr:"~50",unit:"unités",notes:"Nécessite un partenaire d'élimination spécialisé"},
      {waste_type:"Panneaux solaires (fin de vie)",hazard_class:"Non dangereux",source:"Programme de reprise fin de vie",volume_yr:"~20",unit:"unités",notes:"Faibles volumes actuellement ; à suivre pour obligations REP futures"},
      {waste_type:"Onduleurs / régulateurs de charge",hazard_class:"Dangereux (DEEE)",source:"Remplacement sous garantie",volume_yr:"~15",unit:"unités",notes:"Contient de la soudure au plomb ; classification DEEE"},
      {waste_type:"Emballages (carton / plastique)",hazard_class:"Non dangereux",source:"Logistique entrante",volume_yr:"~500",unit:"kg",notes:"Réduire à la source ; réutiliser les cartons si possible"},
    ],
    pt:[
      {waste_type:"Baterias de chumbo-ácido",hazard_class:"Perigoso",source:"Devoluções de clientes / recolha por agente",volume_yr:"~200",unit:"unidades",notes:"Principal fluxo de resíduos eletrónicos; listado na Convenção de Basileia; máxima prioridade"},
      {waste_type:"Baterias de lítio-ião",hazard_class:"Perigoso",source:"Devoluções de clientes / fim de vida",volume_yr:"~50",unit:"unidades",notes:"Requer parceiro especializado de eliminação"},
      {waste_type:"Painéis solares (fim de vida)",hazard_class:"Não perigoso",source:"Programa de recolha de fim de vida",volume_yr:"~20",unit:"unidades",notes:"Baixos volumes atualmente; acompanhar para obrigações de REP futuras"},
      {waste_type:"Inversores / controladores de carga",hazard_class:"Perigoso (REEE)",source:"Substituição em garantia",volume_yr:"~15",unit:"unidades",notes:"Contém soldadura de chumbo; classificação REEE"},
      {waste_type:"Embalagens (cartão / plástico)",hazard_class:"Não perigoso",source:"Logística de entrada",volume_yr:"~500",unit:"kg",notes:"Reduzir na fonte; reutilizar caixas de cartão sempre que possível"},
    ],
  },
  r5_strategy_wmp: {
    fr:[
      {waste_stream:"Batteries plomb-acide",reduce:"Approvisionner des produits plus durables ; réduire les commandes excessives",reuse_repair:"Collecter pour marché secondaire ; reconditionnement via partenaire agréé",recycle:"Recycleur agréé [Nom à confirmer] ; collecte trimestrielle",priority:"ÉLEVÉE — lancer un programme de reprise",target_date:"T1"},
      {waste_stream:"Batteries lithium-ion",reduce:"Produits avec garantie plus longue ; critères d'approvisionnement qualité",reuse_repair:"Programme de réparation sous garantie ; remise en état si viable",recycle:"Recycleur Li-ion spécialisé [Nom à confirmer]",priority:"ÉLEVÉE — identifier partenaire",target_date:"T1"},
      {waste_stream:"Panneaux solaires",reduce:"Programme d'entretien pour prolonger la durée de vie",reuse_repair:"Revendre les unités fonctionnelles sur le marché secondaire",recycle:"Reprise fabricant / recycleur de panneaux [à confirmer]",priority:"MOYENNE — faibles volumes actuellement",target_date:"T2"},
      {waste_stream:"Onduleurs / contrôleurs",reduce:"Approvisionnement qualité ; politique de réparation en priorité",reuse_repair:"Réparation terrain ; remise en état pour revente",recycle:"Partenaire agréé DEEE [à confirmer]",priority:"MOYENNE",target_date:"T2"},
      {waste_stream:"Emballages",reduce:"Consolider les livraisons ; négocier moins d'emballage avec fournisseurs",reuse_repair:"Réutiliser les cartons pour le stockage de pièces détachées",recycle:"Recyclage carton / compostage local",priority:"FAIBLE",target_date:"T3"},
    ],
    pt:[
      {waste_stream:"Baterias de chumbo-ácido",reduce:"Procurar produtos de vida útil mais longa; reduzir sobre-encomendas",reuse_repair:"Coletar para mercado secundário; recondicionamento via parceiro licenciado",recycle:"Reciclador licenciado [Nome a confirmar]; recolha trimestral",priority:"ALTA — lançar programa de recolha",target_date:"T1"},
      {waste_stream:"Baterias de lítio-ião",reduce:"Produtos com garantia mais longa; critérios de qualidade de aprovisionamento",reuse_repair:"Programa de reparação em garantia; recondicionamento se viável",recycle:"Reciclador especializado em lítio [Nome a confirmar]",priority:"ALTA — identificar parceiro",target_date:"T1"},
      {waste_stream:"Painéis solares",reduce:"Programa de manutenção para prolongar vida útil em campo",reuse_repair:"Revender unidades funcionais no mercado secundário",recycle:"Recolha pelo fabricante / reciclador de painéis [a confirmar]",priority:"MÉDIA — baixos volumes atualmente",target_date:"T2"},
      {waste_stream:"Inversores / controladores",reduce:"Aprovisionamento de qualidade; política de reparação prioritária",reuse_repair:"Reparação em campo; recondicionamento para revenda",recycle:"Parceiro licenciado REEE [a confirmar]",priority:"MÉDIA",target_date:"T2"},
      {waste_stream:"Embalagens",reduce:"Consolidar entregas; negociar embalagem reduzida com fornecedores",reuse_repair:"Reutilizar caixas de cartão para armazenamento de peças",recycle:"Reciclagem de cartão / compostagem local",priority:"BAIXA",target_date:"T3"},
    ],
  },
  partners_wmp: {
    fr:[
      {waste_type:"Batteries plomb-acide",partner_name:"[Recycleur à confirmer]",country:"Nigeria",reg_no:"Lic. NESREA N° [X]",collection_freq:"Trimestriel",evidence:"Certificat de recyclage + Bon de transfert de déchets"},
      {waste_type:"Batteries lithium-ion",partner_name:"[Recycleur à confirmer]",country:"Nigeria",reg_no:"[À confirmer — vérifier avec NESREA]",collection_freq:"Semestriel",evidence:"Certificat de recyclage"},
      {waste_type:"Panneaux solaires",partner_name:"[Reprise fabricant à confirmer]",country:"Nigeria",reg_no:"[À confirmer]",collection_freq:"Annuel ou à la demande",evidence:"Bon de transfert de déchets"},
      {waste_type:"Déchets généraux / bureau",partner_name:"Service de collecte municipal",country:"Nigeria",reg_no:"N/A",collection_freq:"Hebdomadaire / mensuel",evidence:"Reçu de collecte"},
    ],
    pt:[
      {waste_type:"Baterias de chumbo-ácido",partner_name:"[Reciclador a confirmar]",country:"Nigéria",reg_no:"Lic. NESREA N.º [X]",collection_freq:"Trimestral",evidence:"Certificado de reciclagem + Nota de transferência de resíduos"},
      {waste_type:"Baterias de lítio-ião",partner_name:"[Reciclador a confirmar]",country:"Nigéria",reg_no:"[A confirmar — verificar com NESREA]",collection_freq:"Semestral",evidence:"Certificado de reciclagem"},
      {waste_type:"Painéis solares",partner_name:"[Recolha pelo fabricante a confirmar]",country:"Nigéria",reg_no:"[A confirmar]",collection_freq:"Anual ou a pedido",evidence:"Nota de transferência de resíduos"},
      {waste_type:"Resíduos gerais / escritório",partner_name:"Serviço de recolha municipal",country:"Nigéria",reg_no:"N/A",collection_freq:"Semanal / mensal",evidence:"Recibo de recolha"},
    ],
  },
  scenarios_epr: {
    fr:[
      {scenario:"Incendie électrique (bureau / entrepôt)",probability:"Medium",severity:"High",priority:"HIGH",response_lead:"Responsable entrepôt / bureau",procedure_ref:"Procédure de réponse incendie (Section A)"},
      {scenario:"Emballement thermique batterie / déversement d'acide",probability:"Medium",severity:"High",priority:"HIGH",response_lead:"Responsable SST",procedure_ref:"Procédure d'urgence batterie (Section B)"},
      {scenario:"Électrocution technicien / incident électrique",probability:"Low",severity:"Critical",priority:"HIGH",response_lead:"Superviseur de terrain",procedure_ref:"Procédure d'incident électrique (Section C)"},
      {scenario:"Accident de véhicule pendant les opérations de terrain",probability:"Medium",severity:"Medium",priority:"MEDIUM",response_lead:"Directeur des opérations de terrain",procedure_ref:"Procédure de rapport d'incident"},
      {scenario:"Incident VBG / EAS/HS",probability:"Low",severity:"High",priority:"HIGH",response_lead:"Point focal EAS/HS",procedure_ref:"Protocole EAS/HS (procédure confidentielle séparée)"},
      {scenario:"Catastrophe naturelle (inondation / tempête)",probability:"Low",severity:"High",priority:"MEDIUM",response_lead:"DG / PDG",procedure_ref:"Plan de continuité des activités"},
      {scenario:"Incident de sécurité (vol / troubles civils)",probability:"Low",severity:"Medium",priority:"MEDIUM",response_lead:"Responsable de sécurité / DG",procedure_ref:"Procédure d'incident de sécurité"},
    ],
    pt:[
      {scenario:"Incêndio elétrico (escritório / armazém)",probability:"Medium",severity:"High",priority:"HIGH",response_lead:"Gerente de armazém / escritório",procedure_ref:"Procedimento de resposta a incêndio (Secção A)"},
      {scenario:"Fuga térmica de bateria / derrame de ácido",probability:"Medium",severity:"High",priority:"HIGH",response_lead:"Responsável por SST",procedure_ref:"Procedimento de emergência de bateria (Secção B)"},
      {scenario:"Eletrocussão de técnico / incidente elétrico",probability:"Low",severity:"Critical",priority:"HIGH",response_lead:"Supervisor de campo",procedure_ref:"Procedimento de incidente elétrico (Secção C)"},
      {scenario:"Acidente de viatura durante operações de campo",probability:"Medium",severity:"Medium",priority:"MEDIUM",response_lead:"Gerente de Operações de Campo",procedure_ref:"Procedimento de Relato de Incidente"},
      {scenario:"Incidente VBG / EAS/AS",probability:"Low",severity:"High",priority:"HIGH",response_lead:"Ponto Focal EAS/AS",procedure_ref:"Protocolo EAS/AS (procedimento confidencial separado)"},
      {scenario:"Catástrofe natural (inundação / tempestade)",probability:"Low",severity:"High",priority:"MEDIUM",response_lead:"DG / CEO",procedure_ref:"Plano de Continuidade de Negócio"},
      {scenario:"Incidente de segurança (roubo / distúrbios civis)",probability:"Low",severity:"Medium",priority:"MEDIUM",response_lead:"Responsável de Segurança / DG",procedure_ref:"Procedimento de Incidente de Segurança"},
    ],
  },
  drills_epr: {
    fr:[
      {drill_type:"Exercice d'évacuation complète du bâtiment / site",frequency:"Semi-annuel",last_completed:"[Date]",next_scheduled:"[Date]",participants:"Tout le personnel de bureau et d'entrepôt",outcome_notes:"[Compléter après l'exercice — documenter les lacunes constatées]"},
      {drill_type:"Exercice de réponse batterie / déversement d'acide",frequency:"Annuel",last_completed:"[Date]",next_scheduled:"[Date]",participants:"Personnel entrepôt + Responsable SST",outcome_notes:"[Compléter après l'exercice]"},
      {drill_type:"Exercice d'incident électrique / LOTO",frequency:"Annuel",last_completed:"[Date]",next_scheduled:"[Date]",participants:"Tous les techniciens de terrain",outcome_notes:"[Compléter après l'exercice]"},
      {drill_type:"Formation utilisation extincteur",frequency:"Annuel",last_completed:"[Date]",next_scheduled:"[Date]",participants:"Tout le personnel",outcome_notes:"[Compléter après la session de formation]"},
    ],
    pt:[
      {drill_type:"Simulacro completo de evacuação do edifício / local",frequency:"Semestral",last_completed:"[Data]",next_scheduled:"[Data]",participants:"Todo o pessoal de escritório e armazém",outcome_notes:"[Completar após simulacro — documentar lacunas encontradas]"},
      {drill_type:"Simulacro de resposta a bateria / derrame de ácido",frequency:"Anual",last_completed:"[Data]",next_scheduled:"[Data]",participants:"Pessoal de armazém + Responsável por SST",outcome_notes:"[Completar após simulacro]"},
      {drill_type:"Simulacro de incidente elétrico / LOTO",frequency:"Anual",last_completed:"[Data]",next_scheduled:"[Data]",participants:"Todos os técnicos de campo",outcome_notes:"[Completar após simulacro]"},
      {drill_type:"Formação em utilização de extintor",frequency:"Anual",last_completed:"[Data]",next_scheduled:"[Data]",participants:"Todo o pessoal",outcome_notes:"[Completar após sessão de formação]"},
    ],
  },
};

// ═══════════════ MANAGEMENT PLANS SECTION ═══════════════
// (Simplified to keep total code within bounds — sub-plans with key fields)
const PLAN_DEFS_SIMPLE = [
  {
    id:"ohs", icon:"🦺", lk:"planLblOHS", ik:"planIntroOHS", color:C.red,
    required:"IFC PS2 / WB ESS2 | ROGEAP Component 4",
    linkedTools:["ppe_matrix","incident_log","training_register"],
    fields:[
      {id:"scope",lk:"plnfldScope",label:"Scope & Management Commitment",t:"ta",rows:3,phk:"phScope"},
      {id:"safety_committee",lk:"plnfldSafetyCommittee",label:"Safety Committee (Members & Meeting Frequency)",t:"ta",rows:3,phk:"phSafetyCommittee"},
      {id:"hazard_summary",lk:"plnfldHazardSummary",label:"Key Hazards & Controls Summary",t:"ta",rows:6,phk:"phHazardSummary"},
      {id:"training_ohs",lk:"plnfldTrainingOHS",label:"Training Programme Summary",t:"ta",rows:4,phk:"phTrainingOHS"},
      {id:"incident_proc",lk:"plnfldIncidentProc",label:"Incident Reporting Procedure",t:"ta",rows:4,phk:"phIncidentProc"},
      {id:"ohs_targets",lk:"plnfldOHSTargets",label:"OHS Performance Targets",t:"ta",rows:3,phk:"phOHSTargets"},
    ]
  },
  {
    id:"community_hs", icon:"🏘️", lk:"planLblCommunity", ik:"planIntroCommunity", color:C.green,
    required:"IFC PS4 / WB ESS4 | ROGEAP Component 4",
    linkedTools:["stakeholder_register"],
    fields:[
      {id:"community_map",lk:"plnfldCommunityMap",label:"Affected Community Mapping",t:"ta",rows:4,phk:"phCommunityMap"},
      {id:"product_safety",lk:"plnfldProductSafety",label:"Product Safety Standards",t:"ta",rows:4,phk:"phProductSafety"},
      {id:"installation_safety",lk:"plnfldInstallSafety",label:"Installation Safety in Communities",t:"ta",rows:3,phk:"phInstallSafety"},
      {id:"waste_community",lk:"plnfldWasteCommunity",label:"Community Waste / E-Waste Impacts",t:"ta",rows:3,phk:"phWasteCommunity"},
      {id:"community_kpis",lk:"plnfldCommunityKPIs",label:"Community Health & Safety Targets",t:"ta",rows:2,phk:"phCommunityKPIs"},
    ]
  },
  {
    id:"consumer", icon:"🛡️", lk:"planLblConsumer", ik:"planIntroConsumer", color:C.teal,
    required:"IFC PS4 | ROGEAP Component 4 | GOGLA Consumer Protection Code",
    linkedTools:["grievance_log"],
    fields:[
      {id:"gogla_status",lk:"plnfldGOGLAStatus",label:"GOGLA CP Code Commitment Status",t:"ta",rows:2,phk:"phGOGLAStatus"},
      {id:"transparency_plan",lk:"plnfldTransparencyPlan",label:"Transparency — Information Provided to Customers",t:"ta",rows:3,phk:"phTransparencyPlan"},
      {id:"responsible_sales_plan",lk:"plnfldResponsibleSales",label:"Responsible Sales — Affordability & Prohibited Behaviours",t:"ta",rows:4,phk:"phResponsibleSales"},
      {id:"service_plan",lk:"plnfldServicePlan",label:"Customer Service — After-Sales & Complaints",t:"ta",rows:4,phk:"phServicePlan"},
      {id:"consumer_kpis",lk:"plnfldConsumerKPIs",label:"Consumer Protection Targets",t:"ta",rows:3,phk:"phConsumerKPIs"},
    ]
  },
  {
    id:"waste", icon:"♻️", lk:"planLblWaste", ik:"planIntroWaste", color:C.green,
    required:"IFC PS3 / WB ESS3 | ROGEAP Component 6",
    linkedTools:["waste_register"],
    fields:[
      {id:"waste_streams",lk:"plnfldWasteStreams",label:"Waste Streams & Volumes (from audit)",t:"table",
       addRowLabel:"➕ Add Waste Stream",addRowLk:"addWasteStream",
       cols:[
         {id:"waste_type",lk:"tblColWasteType",label:"Waste Type",w:"16%"},
         {id:"hazard_class",lk:"tblColHazardClass",label:"Hazard Class",w:"13%"},
         {id:"source",lk:"tblColSource",label:"Source / Process",w:"18%"},
         {id:"volume_yr",lk:"tblColVolumeYr",label:"Est. Volume / Year",w:"13%"},
         {id:"unit",lk:"tblColUnit",label:"Unit",w:"8%"},
         {id:"notes",lk:"tblColNotes",label:"Notes",w:"22%",type:"ta"},
       ],
       baseline:[
         {waste_type:"Lead-acid batteries",hazard_class:"Hazardous",source:"Customer returns / agent collection",volume_yr:"~200",unit:"units",notes:"Primary e-waste stream; Basel Convention listed; highest priority"},
         {waste_type:"Lithium-ion batteries",hazard_class:"Hazardous",source:"Customer returns / EOL",volume_yr:"~50",unit:"units",notes:"Requires specialist disposal partner"},
         {waste_type:"Solar panels (EOL)",hazard_class:"Non-hazardous",source:"EOL take-back programme",volume_yr:"~20",unit:"units",notes:"Low volumes now; track for future EPR obligation"},
         {waste_type:"Inverters / charge controllers",hazard_class:"Hazardous (WEEE)",source:"Warranty replacement",volume_yr:"~15",unit:"units",notes:"Contains lead solder; WEEE classification"},
         {waste_type:"Packaging (cardboard / plastic)",hazard_class:"Non-hazardous",source:"Inbound logistics",volume_yr:"~500",unit:"kg",notes:"Reduce at source; reuse cartons where possible"},
       ]},
      {id:"r5_strategy_wmp",lk:"plnfldR5Strategy",label:"5R Strategy by Waste Stream",t:"table",
       addRowLabel:"➕ Add Strategy Row",addRowLk:"addStrategyRow",
       cols:[
         {id:"waste_stream",lk:"tblColWasteStream",label:"Waste Stream",w:"14%"},
         {id:"reduce",lk:"tblColReduce",label:"Reduce",w:"17%",type:"ta"},
         {id:"reuse_repair",lk:"tblColReuseRepair",label:"Reuse / Repair / Refurbish",w:"20%",type:"ta"},
         {id:"recycle",lk:"tblColRecycle",label:"Recycle",w:"18%",type:"ta"},
         {id:"priority",lk:"tblColPriorityAction",label:"Priority Action",w:"14%",type:"ta"},
         {id:"target_date",lk:"tblColTargetDate",label:"Target Date",w:"9%"},
       ],
       baseline:[
         {waste_stream:"Lead-acid batteries",reduce:"Source longer-life products; reduce over-ordering",reuse_repair:"Collect for secondary market; reconditioning via licensed partner",recycle:"Licensed recycler [Name TBC]; quarterly collection",priority:"HIGH — launch take-back scheme",target_date:"Q1"},
         {waste_stream:"Lithium-ion batteries",reduce:"Longer-warranty products; quality procurement standards",reuse_repair:"Warranty repair programme; refurbishment where viable",recycle:"Specialist Li-ion recycler [Name TBC]",priority:"HIGH — identify partner",target_date:"Q1"},
         {waste_stream:"Solar panels",reduce:"Maintenance programme to extend lifespan in field",reuse_repair:"Resell functional units on secondary market",recycle:"Manufacturer take-back / panel recycler [TBC]",priority:"MEDIUM — low volumes now",target_date:"Q2"},
         {waste_stream:"Inverters / controllers",reduce:"Quality procurement; repair-first policy",reuse_repair:"Field repair; refurbish for resale",recycle:"WEEE-licensed partner [TBC]",priority:"MEDIUM",target_date:"Q2"},
         {waste_stream:"Packaging",reduce:"Consolidate deliveries; negotiate reduced packaging with suppliers",reuse_repair:"Reuse cartons for spare parts storage",recycle:"Cardboard recycling / composting locally",priority:"LOW",target_date:"Q3"},
       ]},
      {id:"takeback_wmp",lk:"plnfldTakeBack",label:"Take-Back Scheme",t:"ta",rows:3,phk:"phTakeBack"},
      {id:"storage_wmp",lk:"plnfldEWasteStorage",label:"E-Waste Storage",t:"ta",rows:3,phk:"phEWasteStorage"},
      {id:"partners_wmp",lk:"plnfldWastePartners",label:"Disposal & Recycling Partners",t:"table",
       addRowLabel:"➕ Add Partner",addRowLk:"addPartner",
       cols:[
         {id:"waste_type",lk:"tblColWasteType",label:"Waste Type",w:"14%"},
         {id:"partner_name",lk:"tblColPartner",label:"Partner / Recycler",w:"17%",type:"ta"},
         {id:"country",lk:"tblColCountry",label:"Country",w:"9%"},
         {id:"reg_no",lk:"tblColRegNo",label:"Regulatory Reg. No.",w:"15%",type:"ta"},
         {id:"collection_freq",lk:"tblColCollFreq",label:"Collection Frequency",w:"14%"},
         {id:"evidence",lk:"tblColEvidence",label:"Evidence / Documentation",w:"21%",type:"ta"},
       ],
       baseline:[
         {waste_type:"Lead-acid batteries",partner_name:"[Recycler TBC]",country:"Nigeria",reg_no:"NESREA Lic. No. [X]",collection_freq:"Quarterly",evidence:"Certificate of Recycling + Waste Transfer Note"},
         {waste_type:"Lithium-ion batteries",partner_name:"[Recycler TBC]",country:"Nigeria",reg_no:"[TBC — verify with NESREA]",collection_freq:"Semi-annual",evidence:"Certificate of Recycling"},
         {waste_type:"Solar panels",partner_name:"[Manufacturer take-back TBC]",country:"Nigeria",reg_no:"[TBC]",collection_freq:"Annual or on demand",evidence:"Waste Transfer Note"},
         {waste_type:"General / office waste",partner_name:"Municipal collection service",country:"Nigeria",reg_no:"N/A",collection_freq:"Weekly / monthly",evidence:"Collection receipt"},
       ]},
      {id:"waste_kpis",lk:"plnfldWasteKPIs",label:"Waste Management Targets",t:"ta",rows:3,phk:"phWasteKPIs"},
    ]
  },
  {
    id:"epr", icon:"🚨", lk:"planLblEPR", ik:"planIntroEPR", color:C.red,
    required:"IFC PS2/PS4 | ROGEAP Component 11",
    linkedTools:["incident_log"],
    fields:[
      {id:"scenarios_epr",lk:"plnfldScenarios",label:"Emergency Scenarios & Priority",t:"table",
       addRowLabel:"➕ Add Scenario",addRowLk:"addScenario",
       cols:[
         {id:"scenario",lk:"tblColScenario",label:"Emergency Scenario",w:"22%",type:"ta"},
         {id:"probability",lk:"tblColProbability",label:"Probability",w:"10%",type:"sel",opts:["Low","Medium","High"]},
         {id:"severity",lk:"tblColSeverity",label:"Severity",w:"10%",type:"sel",opts:["Low","Medium","High","Critical"]},
         {id:"priority",lk:"tblColPriority",label:"Priority",w:"9%",type:"sel",opts:["LOW","MEDIUM","HIGH","CRITICAL"]},
         {id:"response_lead",lk:"tblColResponseLead",label:"Response Lead",w:"16%",type:"ta"},
         {id:"procedure_ref",lk:"tblColProcRef",label:"Procedure Reference",w:"23%",type:"ta"},
       ],
       baseline:[
         {scenario:"Electrical fire (office / warehouse)",probability:"Medium",severity:"High",priority:"HIGH",response_lead:"Warehouse / Office Manager",procedure_ref:"Fire Response Procedure (Section A)"},
         {scenario:"Battery thermal runaway / acid spill",probability:"Medium",severity:"High",priority:"HIGH",response_lead:"OHS Officer",procedure_ref:"Battery Emergency Procedure (Section B)"},
         {scenario:"Technician electrocution / electrical incident",probability:"Low",severity:"Critical",priority:"HIGH",response_lead:"Field Supervisor",procedure_ref:"Electrical Incident Procedure (Section C)"},
         {scenario:"Vehicle accident during field operations",probability:"Medium",severity:"Medium",priority:"MEDIUM",response_lead:"Field Operations Manager",procedure_ref:"Incident Reporting Procedure"},
         {scenario:"GBV / SEAH incident",probability:"Low",severity:"High",priority:"HIGH",response_lead:"SEAH Focal Point",procedure_ref:"SEAH Protocol (separate confidential procedure)"},
         {scenario:"Natural disaster (flood / storm)",probability:"Low",severity:"High",priority:"MEDIUM",response_lead:"MD / CEO",procedure_ref:"Business Continuity Plan"},
         {scenario:"Security incident (theft / civil unrest)",probability:"Low",severity:"Medium",priority:"MEDIUM",response_lead:"Security Officer / MD",procedure_ref:"Security Incident Procedure"},
       ]},
      {id:"ert",lk:"plnfldERT",label:"Emergency Response Team",t:"ta",rows:4,phk:"phERT"},
      {id:"fire_proc_epr",lk:"plnfldFireProc",label:"Fire Response Procedure (key steps)",t:"ta",rows:6,phk:"phFireProc"},
      {id:"electrical_epr",lk:"plnfldElecProc",label:"Electrical Incident Procedure (key steps)",t:"ta",rows:5,phk:"phElecProc"},
      {id:"battery_epr",lk:"plnfldBatteryProc",label:"Battery Emergency Procedure (key steps)",t:"ta",rows:4,phk:"phBatteryProc"},
      {id:"drills_epr",lk:"plnfldDrills",label:"Drill Schedule & Records",t:"table",
       addRowLabel:"➕ Add Drill",addRowLk:"addDrill",
       cols:[
         {id:"drill_type",lk:"tblColDrillType",label:"Drill Type",w:"22%",type:"ta"},
         {id:"frequency",lk:"tblColFrequency",label:"Frequency",w:"11%"},
         {id:"last_completed",lk:"tblColLastCompleted",label:"Last Completed",w:"13%"},
         {id:"next_scheduled",lk:"tblColNextScheduled",label:"Next Scheduled",w:"13%"},
         {id:"participants",lk:"tblColParticipants",label:"Participants",w:"20%",type:"ta"},
         {id:"outcome_notes",lk:"tblColOutcome",label:"Outcome / Lessons Learned",w:"21%",type:"ta"},
       ],
       baseline:[
         {drill_type:"Full building / site evacuation drill",frequency:"Semi-annual",last_completed:"[Date]",next_scheduled:"[Date]",participants:"All office and warehouse staff",outcome_notes:"[Complete after drill — document gaps found]"},
         {drill_type:"Battery / acid spill response drill",frequency:"Annual",last_completed:"[Date]",next_scheduled:"[Date]",participants:"Warehouse staff + OHS Officer",outcome_notes:"[Complete after drill]"},
         {drill_type:"Electrical incident / LOTO drill",frequency:"Annual",last_completed:"[Date]",next_scheduled:"[Date]",participants:"All field technicians",outcome_notes:"[Complete after drill]"},
         {drill_type:"Fire extinguisher use training",frequency:"Annual",last_completed:"[Date]",next_scheduled:"[Date]",participants:"All staff",outcome_notes:"[Complete after training session]"},
       ]},
    ]
  },
  {
    id:"hr_plan", icon:"👷", lk:"planLblHR", ik:"planIntroHR", color:C.navyLight,
    required:"IFC PS2 / WB ESS2 | ROGEAP Component 5",
    linkedTools:["training_register"],
    fields:[
      {id:"workforce",lk:"plnfldWorkforce",label:"Current Workforce Profile",t:"ta",rows:2,phk:"phWorkforce"},
      {id:"recruitment_hr",lk:"plnfldRecruitment",label:"Recruitment & Equal Opportunity Process",t:"ta",rows:3,phk:"phRecruitment"},
      {id:"wages_hr",lk:"plnfldWagesHours",label:"Wages, Hours & Benefits",t:"ta",rows:4,phk:"phWagesHours"},
      {id:"women_plan",lk:"plnfldWomenPlan",label:"Women's Health, Safety & Inclusion",t:"ta",rows:3,phk:"phWomenPlan"},
      {id:"coc_rollout",lk:"plnfldCoCRollout",label:"Code of Conduct Rollout",t:"ta",rows:3,phk:"phCoCRollout"},
    ]
  },
  {
    id:"sep_plan", icon:"🤝", lk:"planLblSEP", ik:"planIntroSEP", color:C.purple,
    required:"WB ESS10 | IFC PS1 | ROGEAP Component 7",
    linkedTools:["stakeholder_register","grievance_log"],
    fields:[
      {id:"sep_objectives",lk:"plnfldSEPObjectives",label:"Stakeholder Engagement Objectives",t:"ta",rows:2,phk:"phSEPObjectives"},
      {id:"key_engagement",lk:"plnfldKeyEngagement",label:"Key Engagement Activities by Group",t:"ta",rows:7,phk:"phKeyEngagement"},
      {id:"fpic_sep",lk:"plnfldFPIC",label:"Free, Prior, and Informed Consent (FPIC)",t:"ta",rows:3,phk:"phFPIC"},
      {id:"gender_sep",lk:"plnfldGenderSEP",label:"Gender-Inclusive Engagement",t:"ta",rows:3,phk:"phGenderSEP"},
      {id:"sep_records",lk:"plnfldSEPRecords",label:"Documentation & Reporting Back",t:"ta",rows:3,phk:"phSEPRecords"},
    ]
  },
  {
    id:"grm_plan", icon:"📣", label:"Grievance Redress Mechanism Plan", color:"#6C3483",
    lk:"planLblGRM", ik:"planIntroGRM",
    required:"WB ESS10 | IFC PS1 | ROGEAP §13 (pp.90-94) | ROGEAP GRM Operational Manual",
    intro:"Establishes your company's system for receiving, processing, and resolving complaints from workers, customers, and communities. The GRM Plan governs the design and governance of the mechanism; the Grievance Log tool (Section 6) provides the day-to-day operational register for recording cases.",
    linkedTools:["grievance_log","stakeholder_register"],
    fields:[
      {id:"grm_scope",lk:"grmScope",label:"GRM Scope & Objectives",t:"ta",rows:3,phk:"phGrmScope"},
      {id:"grm_channels",lk:"grmChannels",label:"Complaint Channels (how to submit a grievance)",t:"ta",rows:5,phk:"phGrmChannels"},
      {id:"grm_process",lk:"grmProcess",label:"Five-Stage Processing Procedure (ROGEAP Table 18)",t:"ta",rows:8,phk:"phGrmProcess"},
      {id:"grm_levels",lk:"grmLevels",label:"Grievance Level Classification & Escalation",t:"ta",rows:5,phk:"phGrmLevels"},
      {id:"grm_seah_protocol",lk:"grmSeahProtocol",label:"GBV/SEAH Special Protocol",t:"ta",rows:6,phk:"phGrmSeahProtocol"},
      {id:"grm_roles",lk:"grmRoles",label:"GRM Roles & Responsibilities",t:"ta",rows:4,phk:"phGrmRoles"},
      {id:"grm_timeline",lk:"grmTimeline",label:"Response Timelines Commitment",t:"ta",rows:4,phk:"phGrmTimeline"},
      {id:"grm_accessibility",lk:"grmAccessibility",label:"Accessibility & Inclusion",t:"ta",rows:4,phk:"phGrmAccessibility"},
      {id:"grm_transparency",lk:"grmTransparency",label:"Transparency & Reporting",t:"ta",rows:3,phk:"phGrmTransparency"},
      {id:"grm_review",lk:"grmReview",label:"GRM Review, Improvement & Capacity",t:"ta",rows:3,phk:"phGrmReview"},
      {id:"grm_kpis",lk:"grmKpis",label:"GRM Performance Targets",t:"ta",rows:4,phk:"phGrmKpis"},
    ]
  },
];

// ═══════════════ BUSINESS PROFILE SECTION ═══════════════
function BusinessProfileSection({ esmsData, setFieldValue }) {
  const { lang, t } = useLang();
  const L = BP_LABELS[lang] || BP_LABELS.en;
  const [activeCard, setActiveCard] = useState(null);

  const hasData = (id) => {
    const d = esmsData[`bp_${id}`] || {};
    return Object.keys(d).some(k => !!d[k]);
  };

  const loadSample = () => {
    if (!window.confirm(t("bpSampleConfirm"))) return;
    Object.entries(BP_SAMPLE_DATA).forEach(([key, val]) => {
      Object.entries(val).forEach(([field, value]) => {
        setFieldValue(key, field, value);
      });
    });
  };

  if (activeCard !== null) {
    const def = BUSINESS_PROFILE_DEFS[activeCard];
    const dataKey = `bp_${def.id}`;
    const d = esmsData[dataKey] || {};
    const set = (k, v) => setFieldValue(dataKey, k, v);
    return (
      <div>
        <button onClick={() => setActiveCard(null)} style={{ ...S.outBtn, marginBottom:18, display:"flex", alignItems:"center", gap:6 }}>{t("bpBack")}</button>
        <div style={{ ...S.card, marginBottom:18, borderLeft:`5px solid ${def.color}` }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
            <div style={{ fontSize:30 }}>{def.icon}</div>
            <div style={{ flex:1 }}>
              <h3 style={{ margin:0, fontFamily:F.d, color:C.text, fontSize:19 }}>{t(def.lk)}</h3>
              <p style={{ margin:"8px 0 0", color:C.muted, fontSize:13, lineHeight:1.5 }}>{t(def.dk)}</p>
            </div>
          </div>
        </div>
        <InfoBox col={C.amber} bg="#FFF8ED">{t("bpInfoBox")}</InfoBox>
        {def.fields.map(f => {
          const label = L[f.id] || f.id;
          return (
            <div key={f.id} style={{ marginBottom:20 }}>
              <Lbl c={label}/>
              {f.type === "text" && (
                <input value={d[f.id]||""} onChange={e=>set(f.id,e.target.value)} style={S.inp}/>
              )}
              {f.type === "number" && (
                <input type="number" value={d[f.id]||""} onChange={e=>set(f.id,e.target.value)} style={S.inp}/>
              )}
              {f.type === "ta" && (
                <textarea value={d[f.id]||""} onChange={e=>set(f.id,e.target.value)} rows={f.rows||3} style={S.ta}/>
              )}
              {f.type === "bool" && (
                <select value={d[f.id]||""} onChange={e=>set(f.id,e.target.value)} style={S.inp}>
                  <option value="">—</option>
                  <option value="yes">{L.yes}</option>
                  <option value="no">{L.no}</option>
                </select>
              )}
              {f.type === "sel" && (
                <select value={d[f.id]||""} onChange={e=>set(f.id,e.target.value)} style={S.inp}>
                  <option value="">—</option>
                  {f.opts.map(o => <option key={o} value={o}>{L[o]||o}</option>)}
                </select>
              )}
            </div>
          );
        })}
        <div style={{ marginTop:24, paddingTop:16, borderTop:`1.5px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <ExportBar
            title={`${t("bpTitle")} — ${t(def.lk)}`}
            filename={`BP_${def.id}`}
            sections={buildBPSections(esmsData, L, t, def)}
            esmsData={esmsData}
          />
          <div style={{ display:"flex", gap:10 }}>
            {activeCard > 0 && (
              <button onClick={() => setActiveCard(activeCard-1)} style={S.outBtn}>← {t(BUSINESS_PROFILE_DEFS[activeCard-1].lk)}</button>
            )}
            {activeCard < BUSINESS_PROFILE_DEFS.length-1 && (
              <button onClick={() => setActiveCard(activeCard+1)} style={S.btn}>{t(BUSINESS_PROFILE_DEFS[activeCard+1].lk)} →</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:18, paddingBottom:18, borderBottom:`2px solid ${C.border}` }}>
        <div style={{ fontSize:34 }}>🏢</div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4, flexWrap:"wrap" }}>
            <h2 style={{ margin:0, color:C.text, fontSize:22, fontFamily:F.d }}>{t("bpTitle")}</h2>
            <Tag label={t("bpOptional")} col={C.amber} bg="#FFF3DC"/>
          </div>
          <p style={{ margin:0, color:C.muted, fontSize:14, lineHeight:1.6 }}>{t("bpDesc")}</p>
        </div>
        <button onClick={loadSample} style={{ ...S.outBtn, fontSize:11, whiteSpace:"nowrap", flexShrink:0, marginTop:2 }}>{t("bpSampleLoad")}</button>
      </div>
      <InfoBox col={C.amber} bg="#FFF8ED">{t("bpInfoBox")}</InfoBox>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:14 }}>
        {BUSINESS_PROFILE_DEFS.map((def, i) => {
          const done = hasData(def.id);
          return (
            <div key={def.id} onClick={() => setActiveCard(i)}
              style={{ background:"white", padding:18, borderRadius:10, cursor:"pointer", transition:"all 0.15s", position:"relative",
                borderStyle:"solid",
                borderTopWidth:"1.5px", borderRightWidth:"1.5px", borderBottomWidth:"1.5px", borderLeftWidth:"5px",
                borderTopColor: done ? C.green : C.border, borderRightColor: done ? C.green : C.border,
                borderBottomColor: done ? C.green : C.border, borderLeftColor: def.color }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}>
              {done && <span style={{ position:"absolute", top:10, right:10, fontSize:14 }}>✅</span>}
              <div style={{ fontSize:26, marginBottom:6 }}>{def.icon}</div>
              <div style={{ fontWeight:700, color:C.text, fontSize:14, marginBottom:3 }}>{t(def.lk)}</div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.4, marginBottom:10 }}>{t(def.dk)}</div>
              <div style={{ fontSize:11, color:def.color, fontWeight:600 }}>{t("toolsOpen")}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:20, paddingTop:16, borderTop:`1.5px solid ${C.border}` }}>
        <ExportBar
          title={t("bpTitle")}
          filename="Business_Profile"
          sections={buildBPSections(esmsData, L, t)}
          esmsData={esmsData}
        />
      </div>
    </div>
  );
}

function ManagementPlansSection({ esmsData, setFieldValue, openGuide }) {
  const {t,lang}=useLang();
  const [active, setActive] = useState(null);
  const translateCols = (cols) => cols.map(c => {
    if (c.type !== "sel" || !c.opts) return c;
    const m = {"Low":t("optLow"),"Medium":t("optMedium"),"High":t("optHigh"),"Critical":t("optCritical"),"LOW":t("optLOW"),"MEDIUM":t("optMEDIUM"),"HIGH":t("optHIGH"),"CRITICAL":t("optCRITICAL")};
    return {...c, transOpts: c.opts.map(o => m[o]||o)};
  });

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
            <Lbl c={f.lk ? t(f.lk) : f.label} req={f.req}/>
            {f.hint && <Hint c={f.hint}/>}
            {f.t === "text" && <input value={d[f.id]||""} onChange={e=>set(f.id,e.target.value)} placeholder={f.phk ? t(f.phk) : (f.ph||"")} style={S.inp}/>}
            {f.t === "ta" && <textarea value={d[f.id]||""} onChange={e=>set(f.id,e.target.value)} placeholder={f.phk ? t(f.phk) : (f.ph||"")} rows={f.rows||4} style={S.ta}/>}
            {f.t === "cbl" && <ChecklistBuilder baseline={f.items||[]} value={d[f.id]} onChange={v=>set(f.id,v)}/>}
            {f.t === "table" && <TableBuilder columns={translateCols(f.cols||[])} baselineRows={PLAN_TABLE_BASELINES[f.id]?.[lang]||f.baseline||[]} value={d[f.id]} onChange={v=>set(f.id,v)} addRowLabel={f.addRowLk?t(f.addRowLk):(f.addRowLabel||t("addRow")||"➕ Add Row")}/>}
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
  const {t,lang}=useLang();
  const langRisks=BASELINES_I18N.risks[lang]||BASELINE_RISKS;
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
        <ExportBar title={t("risksTitle")} filename="ESMS_Risk_Register"
          sections={buildRiskSections(esmsData)}
          csvCols={getToolCSVDefs(t).risk_matrix.cols}
          csvRows={esmsData.risk_register?.data?.length?esmsData.risk_register.data:langRisks}
          esmsData={esmsData}/>
      </div>
      <RiskMatrix baselineRisks={langRisks} value={val} onChange={set}/>
    </div>
  );
}

// ═══════════════ COMPLIANCE SECTION ═══════════════
function ComplianceSection({ esmsData, setFieldValue, openGuide }) {
  const {t,lang}=useLang();
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
        <ExportBar title={t("complianceTitle")} filename="ESMS_Compliance"
          sections={buildComplianceSections(esmsData,t)}
          csvCols={getToolCSVDefs(t).compliance.cols}
          csvRows={esmsData.compliance_tracker?.data?.length?esmsData.compliance_tracker.data:(BASELINES_I18N.compliance[lang]||COMPLIANCE_BASELINE)}
          esmsData={esmsData}/>
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

// Compact PDF + Word buttons for the BP card on the Overview page
function BPCardExport({ esmsData, L, t }) {
  const [busy, setBusy] = useState(null);
  const run = async (type) => {
    setBusy(type);
    try {
      const secs = buildBPSections(esmsData, L, t);
      const strings = { noEntries: t('noEntries'), notCompleted: t('notCompleted'), coverLine: t('exportCoverLine'), footerLine: t('exportFooterLine'), generated: t('exportGenerated') };
      if (type === 'pdf') await exportPDF(t('bpTitle'), secs, strings);
      else exportWord(t('bpTitle'), secs, strings);
    } catch(e) { alert(`Export error: ${e.message}`); }
    setBusy(null);
  };
  const btn = (type, icon, label) => (
    <button onClick={() => run(type)} disabled={!!busy}
      style={{ borderRadius:6, padding:'4px 9px', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:F.b, display:'flex', alignItems:'center', gap:4, opacity:busy?0.65:1,
        background: type==='pdf' ? '#FDECEA' : '#EBF5FB',
        color:      type==='pdf' ? C.red      : C.navyLight,
        border:     type==='pdf' ? `1.5px solid ${C.red}` : `1.5px solid ${C.navyLight}` }}>
      {busy===type ? '⏳' : icon} {busy===type ? '…' : label}
    </button>
  );
  return (
    <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:2 }}>
      {btn('pdf',  '📄', 'PDF')}
      {btn('word', '📝', 'Word')}
    </div>
  );
}

// ═══════════════ SECTION PROGRESS ═══════════════
// Pure function — safe to call outside React components
function calcSectionProgress(sectionId, esmsData) {
  if (sectionId === "business_profile") {
    let done=0,total=0;
    BUSINESS_PROFILE_DEFS.forEach(def=>{
      const dat=esmsData[`bp_${def.id}`]||{};
      def.fields.forEach(f=>{total++;const v=dat[f.id];if(v!==undefined&&v!==''&&v!==false&&v!==null)done++;});
    });
    return {pct:total>0?Math.round(done/total*100):0,done,total};
  }
  if (sectionId === "screening") {
    const data=esmsData["screening_q"]?.data||{};
    const TOTAL=32; // 6+8+8+5+5 questions
    const done=Object.values(data).filter(v=>v?.answer).length;
    return {pct:Math.min(100,Math.round(done/TOTAL*100)),done,total:TOTAL};
  }
  if (sectionId === "policy") {
    const total=PLAN_DEFS_SIMPLE.length;
    const done=PLAN_DEFS_SIMPLE.filter(p=>{const dat=esmsData[`policy_${p.id}`]||{};return Object.keys(dat).some(k=>!!dat[k]);}).length;
    return {pct:Math.round(done/total*100),done,total};
  }
  if (sectionId === "risks") {
    const rows=esmsData["risk_register"]?.data||[];
    if(!rows.length) return {pct:0,done:0,total:0};
    const done=rows.filter(r=>r.risk?.trim()&&r.mitigation?.trim()).length;
    return {pct:Math.round(done/rows.length*100),done,total:rows.length};
  }
  if (sectionId === "compliance") {
    const rows=esmsData["compliance_tracker"]?.data||[];
    if(!rows.length) return {pct:0,done:0,total:0};
    const done=rows.filter(r=>r.status&&r.status!=='').length;
    return {pct:Math.round(done/rows.length*100),done,total:rows.length};
  }
  if (sectionId === "plans") {
    let done=0,total=0;
    PLAN_DEFS_SIMPLE.forEach(p=>{
      const dat=esmsData[`plan_${p.id}`]||{};
      p.fields.forEach(f=>{
        total++;const v=dat[f.id];
        if(f.t==="table"){if(Array.isArray(v)&&v.length>0)done++;}
        else if(typeof v==="string"&&v.trim())done++;
      });
    });
    return {pct:total>0?Math.round(done/total*100):0,done,total};
  }
  if (sectionId === "tools") {
    const nonRedir=Object.values(TOOLS_REGISTRY).filter(tt=>!tt.redirectTo);
    const total=nonRedir.length;
    const done=nonRedir.filter(tt=>{const d=esmsData[`tool_${tt.id}`]?.data;return Array.isArray(d)?d.length>0:!!(d&&typeof d==='object'&&Object.keys(d).length>0);}).length;
    return {pct:Math.round(done/total*100),done,total};
  }
  if (sectionId === "esap") {
    const rows=esmsData["tool_esap"]?.data||[];
    if(!rows.length) return {pct:0,done:0,total:0};
    const done=rows.filter(r=>r.action?.trim()).length;
    return {pct:Math.round(done/rows.length*100),done,total:rows.length};
  }
  return {pct:0,done:0,total:0};
}

const PROG_LABEL_KEYS = {
  business_profile:"progBP", screening:"progScreening", policy:"progPolicy",
  risks:"progRisks", compliance:"progCompliance", plans:"progPlans",
  tools:"progTools", esap:"progEsap",
};

function SectionProgressBar({sectionId, esmsData}){
  const {t}=useLang();
  const {pct,done,total}=calcSectionProgress(sectionId,esmsData);
  const lk=PROG_LABEL_KEYS[sectionId];
  if(!lk||total===0) return null;
  const col=pct===100?C.green:pct>0?C.amber:C.muted;
  return(
    <div style={{marginBottom:18,padding:"9px 14px",background:pct===100?"#F0FFF4":"white",borderRadius:8,border:`1.5px solid ${pct===100?C.green+"55":C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <span style={{fontSize:12,color:C.muted}}>{done} / {total} {t(lk)}</span>
        <span style={{fontSize:12,fontWeight:700,color:col}}>{pct===100?`${t("progressComplete")} ✓`:`${pct}%`}</span>
      </div>
      <div style={{background:C.bg,borderRadius:4,height:5,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,background:col,height:"100%",borderRadius:4,transition:"width 0.4s ease"}}/>
      </div>
    </div>
  );
}

// ═══════════════ WELCOME ═══════════════
function Welcome({ esmsData, setActive, openGuide, nav }) {
  const {t,lang}=useLang();
  const navList = nav || NAV_DEFS;
  const L = BP_LABELS[lang] || BP_LABELS.en;
  const [bpHover, setBpHover] = useState(false);
  const [bpExportOpen, setBpExportOpen] = useState(false);
  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const isSectionDone = (n) => {
    if (n.id === "business_profile") return BUSINESS_PROFILE_DEFS.some(d => {
      const dat = esmsData[`bp_${d.id}`] || {};
      return Object.keys(dat).some(k => !!dat[k]);
    });
    if (n.id === "tools") return Object.keys(TOOLS_REGISTRY).some(t => !!(esmsData[`tool_${t}`]?.data));
    if (n.id === "policy") return PLAN_DEFS_SIMPLE.some(p => !!(esmsData[`policy_${p.id}`] && Object.keys(esmsData[`policy_${p.id}`]||{}).length > 0));
    if (n.id === "plans") return PLAN_DEFS_SIMPLE.some(p => !!(esmsData[`plan_${p.id}`] && Object.keys(esmsData[`plan_${p.id}`]||{}).length > 0));
    if (n.id === "risks") return !!(esmsData["risk_register"]?.data);
    if (n.id === "compliance") return !!(esmsData["compliance_tracker"]?.data);
    if (n.id === "screening") return !!(esmsData["screening_q"]?.data);
    if (n.id === "esap") return !!(esmsData["tool_esap"]?.data?.length);
    return false;
  };
  const requiredNav = navList.filter(n => n.id !== "welcome" && !n.optional);
  const completedSections = requiredNav.filter(n => isSectionDone(n)).length;
  const total = requiredNav.length;

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
          const done = isSectionDone(n);
          const isOpt = !!n.optional;
          const isBP = n.id === "business_profile";
          return (
            <div key={n.id} onClick={() => { if (isBP && isTouch && bpExportOpen) { setBpExportOpen(false); return; } setActive(n.id); }}
              style={{ ...S.card, cursor:"pointer", border:`2px solid ${done ? C.green : (isOpt ? C.amber : C.border)}`, transition:"all 0.12s", position:"relative", textAlign:"center", padding:"16px 14px", overflow:"hidden" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; if (isBP && !isTouch) setBpHover(true); }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; if (isBP && !isTouch) setBpHover(false); }}>
              {done && <span style={{ position:"absolute", top:8, right:8, fontSize:13 }}>✅</span>}
              {isOpt && !done && <span style={{ position:"absolute", top:8, right:8, fontSize:9, background:"#FFF3DC", color:C.amber, borderRadius:4, padding:"1px 5px", fontWeight:700, letterSpacing:0.3 }}>{t("bpOptional")}</span>}
              <div style={{ fontSize:24, marginBottom:6 }}>{n.icon}</div>
              <div style={{ fontWeight:700, fontSize:12, color:C.text }}>{n.label}</div>
              {(()=>{const{pct}=calcSectionProgress(n.id,esmsData);return pct>0?(<div style={{position:"absolute",bottom:0,left:0,right:0,height:3,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:pct===100?C.green:C.amber,transition:"width 0.3s"}}/></div>):null;})()}
              {isBP && isTouch && (
                <button
                  onClick={e => { e.stopPropagation(); setBpExportOpen(v => !v); }}
                  aria-label="Export Business Profile"
                  style={{ position:"absolute", bottom:6, right:6, background:"rgba(255,248,235,0.95)", border:`1px solid ${C.amber}`, borderRadius:5, padding:"2px 6px", fontSize:10, color:C.amber, fontWeight:700, cursor:"pointer", lineHeight:1.4, zIndex:2 }}>
                  ⬇ Export
                </button>
              )}
              {isBP && (
                <div onClick={e => e.stopPropagation()}
                  style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(255,248,235,0.97)", borderTop:"1px dashed rgba(232,160,32,0.45)", padding:"6px 8px 7px", textAlign:"left", opacity: (isTouch ? bpExportOpen : bpHover) ? 1 : 0, pointerEvents: (isTouch ? bpExportOpen : bpHover) ? "auto" : "none", transition:"opacity 0.18s" }}>
                  <div style={{ fontSize:9, color:C.amber, lineHeight:1.3, marginBottom:4 }}>Not in Full ESMS — export separately:</div>
                  <BPCardExport esmsData={esmsData} L={L} t={t}/>
                </div>
              )}
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
      { label: "GOGLA ESMS Guidelines for Off-Grid Solar Companies (Standards Page)", url: "https://www.gogla.org/what-we-do/business-services-and-standards/" },
      { label: "REA Nigeria — Rural Electrification Agency", url: "https://rea.gov.ng/" },
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
      { label: "ECOWAS ESRM Guide on Off-Grid Solar", url: "https://www.ecowas.int/wp-content/uploads/2022/08/ROGEAP-Annex7-ESRM-Section-Guide-on-Off-Grid-Solar-for-CFI_19Dec2020-final.pdf" },
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
      { label: "ILO Safety and Health at Work — Resources for Solar Sector", url: "https://www.ilo.org/global/topics/safety-and-health-at-work/" },
      { label: "GOGLA E-Waste Toolkit", url: "https://www.gogla.org/what-we-do/circularity/e-waste-toolkit/" },
      { label: "GOGLA Business Blueprints for E-Waste", url: "https://www.gogla.org/tools/business-blueprints-for-e-waste-management/" },
      { label: "ACE-TAF — E-Waste Resources for Off-Grid Solar", url: "https://www.ace-taf.org/" },
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
      { label: "CAO Ombudsman — Grievance Mechanism Resources", url: "https://www.cao-ombudsman.org/resources" },
      { label: "IFC ESMS Implementation Handbook — General (2015)", url: "https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
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
      { label: "ECOWAS ESRM Guide on Off-Grid Solar", url: "https://www.ecowas.int/wp-content/uploads/2022/08/ROGEAP-Annex7-ESRM-Section-Guide-on-Off-Grid-Solar-for-CFI_19Dec2020-final.pdf" },
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
      { label: "CAO Ombudsman — Grievance Mechanism Resources", url: "https://www.cao-ombudsman.org/resources" },
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
      { label: "ACE-TAF — E-Waste Resources for Off-Grid Solar", url: "https://www.ace-taf.org/" },
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

  // ── GRM PLAN ───────────────────────────────────────────────────────
  grm_plan: {
    id: "grm_plan",
    title: "Grievance Redress Mechanism Plan",
    color: "#6C3483",
    rogeapRef: "ROGEAP §13 (pp.90-94); Tables 18-21; ROGEAP GRM Operational Manual",
    ifcRef: "IFC PS1; IFC ESMS Toolkit Element 6; WB ESS10",
    summary: "The GRM Plan establishes the governance, design, and operating procedures of your company's Grievance Redress Mechanism (GRM) — the formal system through which workers, customers, and community members can raise concerns, seek remediation, and have their complaints addressed fairly and in a timely manner. The GRM is required by ROGEAP, WB ESS10, and IFC PS1. It complements the Grievance Log (Section 6 tool) which records day-to-day case management.",
    sections: [
      {
        heading: "What a GRM Plan must contain",
        body: "ROGEAP §13 (pp.90-94) and the ROGEAP GRM Operational Manual specify that a company's GRM must include the following design elements:\n\n1. SCOPE: Who can use it (workers, customers, communities, contractors) and what types of complaints are covered\n2. CHANNELS: How complaints can be submitted (phone, email, in-person, written, anonymous box) — multiple channels are required to ensure accessibility\n3. PROCESS: The five-stage processing procedure (Identification → Assessment → Acknowledgement → Response → Monitoring) with defined timelines at each stage\n4. ESCALATION LEVELS: Level 1 (one-off/minor), Level 2 (widespread/repeated), Level 3 (breach of law or serious harm) — each with different response requirements\n5. SEAH PROTOCOL: A separate, confidential process for GBV/Sexual Exploitation, Abuse, and Harassment complaints\n6. ROLES: Named individuals responsible for operating the GRM\n7. TIMELINES: Committed response timelines communicated to complainants\n8. ACCESSIBILITY: Provisions for illiterate, anonymous, and vulnerable complainants\n9. TRANSPARENCY: How GRM performance will be reported internally and externally\n10. REVIEW: How the mechanism will be assessed and improved over time\n\nThe ROGEAP GRM Operational Manual is the authoritative document for design standards. Source: ROGEAP §13, pp.90-94; ROGEAP GRM Operational Manual (2023)."
      },
      {
        heading: "Five-Stage ROGEAP Process (Tables 18-21)",
        body: "ROGEAP Table 18 (p.92) specifies a five-stage GRM process:\n\nSTAGE 1 — IDENTIFICATION (Day 1): Complaint received via any channel and logged immediately by the GRM Officer. A unique case number is assigned.\n\nSTAGE 2 — ASSESSMENT & LOGGING (Days 1-3): Significance of complaint assessed. Assigned a Level: Level 1 (one-off event), Level 2 (widespread or repeated), Level 3 (breach of law or company policy). Recorded in GRM log. Complainant acknowledged.\n\nSTAGE 3 — ACKNOWLEDGEMENT (within 3 days): Formal written acknowledgement sent to complainant confirming receipt, case number, and expected timeline.\n\nSTAGE 4 — RESPONSE DEVELOPMENT & IMPLEMENTATION (Days 4-15): Complaint assigned to appropriate person for resolution. Response developed with management input as needed. Redress action implemented. Outcome communicated to complainant in writing.\n\nSTAGE 5 — MONITORING: Outcomes tracked. Complainant satisfaction confirmed. Grievance data reviewed quarterly for systemic trends. Mechanism updated based on lessons learned.\n\nSource: ROGEAP Tables 18-21, pp.92-94; ROGEAP GRM Operational Manual."
      },
      {
        heading: "GBV/SEAH Complaints — Mandatory Special Protocol",
        body: "GBV/Sexual Exploitation, Abuse, and Harassment (SEAH) complaints must follow a completely separate, confidential process. The ROGEAP GRM Operational Manual specifies five non-negotiable principles:\n\n• ETHICAL: All actions must respect the dignity, rights, and autonomy of the survivor at all times\n• CONFIDENTIAL: Information shared only on a strict need-to-know basis; personal details never in the general GRM log\n• NON-BIASED: Dedicated, trained investigators who recognise and manage their own biases\n• RAPID: Initial response within 24-72 hours; clear timelines communicated to survivor\n• SURVIVOR-CENTRED: Survivor's safety, needs, and well-being take priority; proactive referral to medical, psychosocial, and legal services\n\nThe SEAH log must be maintained separately, password-protected, and accessible only to designated personnel. In the general GRM log, record only the NATURE of complaint (e.g. 'SEAH') and PROCESSING OUTCOME — never victim personal details.\n\nThe company must designate a dedicated, trained SEAH Focal Point who is different from the complainant's line manager. Female focal points are strongly recommended in mixed-gender workplaces.\n\nSource: ROGEAP §13, pp.91-92; ROGEAP GRM Operational Manual, Section 4."
      },
      {
        heading: "Relationship between GRM Plan and Grievance Log",
        body: "The GRM Plan (this section) and the Grievance Log tool (Section 6) are complementary but distinct components of your ESMS:\n\nGRM PLAN sets out the SYSTEM DESIGN:\n• Governance structure (who is responsible, what authority they have)\n• Complaint channels and intake procedures\n• Processing stages and timelines\n• Level classification and escalation rules\n• SEAH special protocol\n• Accessibility and inclusion provisions\n• Reporting and review commitments\n\nGRIEVANCE LOG is the OPERATIONAL RECORD:\n• Individual case register (one row per complaint)\n• Fields for case number, date, complainant, nature, level, assigned to, action taken, outcome, satisfaction\n• Evidences that the GRM Plan is being implemented\n• Used for quarterly ROGEAP monitoring reports\n\nInvestors, auditors, and ROGEAP reviewers will ask to see BOTH: the Plan (to verify the system is properly designed) and the Log (to verify it is being used). Absence of the Log is treated as absence of implementation even if the Plan exists."
      },
      {
        heading: "IFC Requirements and Design Principles",
        body: "IFC Performance Standard 1 (Assessment and Management of Environmental and Social Risks) requires that companies establish a 'grievance mechanism for Affected Communities' that meets these criteria:\n\n• PROPORTIONALITY: Scaled to the risks and adverse impacts of the project\n• ACCESSIBILITY: Accessible to all affected people without cost, and without fear of retaliation\n• TRANSPARENT: Affected communities are informed of how the mechanism works\n• LEGITIMATE: Operated in a culturally appropriate manner and with appropriate authority\n• CULTURALLY APPROPRIATE: Methods and channels suitable to local context\n• GENDER-SENSITIVE: Specific design features for women and vulnerable groups\n• CONFIDENTIAL: Personal information protected\n\nThe IFC ESMS Toolkit Element 6 (Operational Control) frames grievance management as an operational control measure — not just a complaint box, but a systematic process integrated into company management.\n\nWB ESS10 adds that the grievance mechanism must be established early in project implementation, before activities begin in new communities. It must provide for GBV/SEA/SH complaints via a separate, safe channel.\n\nSource: IFC PS1 §35-36; IFC ESMS Toolkit Element 6; WB ESS10 §§20-24."
      },
      {
        heading: "Practical Guidance for OGS Companies",
        body: "For off-grid solar companies operating in West and Central Africa, the following practical points apply:\n\nMULTIPLE CHANNELS ARE ESSENTIAL: Many customers in rural areas are more comfortable using WhatsApp or calling than submitting written complaints. Phone and WhatsApp channels are typically the most used by OGS customers.\n\nANONYMITY: A significant proportion of complaints — particularly those involving SEAH, agent misconduct, or sensitive issues — will only be submitted if anonymity is possible. An anonymous channel (suggestion box, anonymous email, or anonymous WhatsApp) must be available and communicated.\n\nLANGUAGE: The GRM must operate in the languages your customers and workers actually speak — not just the official national language. Verbal complaints must be accepted for customers with low literacy.\n\nAGENT MISCONDUCT: A common complaint category for OGS companies is agent misconduct (mis-selling, harassment, false promises). The GRM must be accessible to customers independently of the agent who sold to them — customers must be able to contact the company directly.\n\nROGEAP MONITORING: Grievance data (number received, resolved, pending, by category) must be reported in every quarterly ROGEAP E&S Monitoring Form (Table 22). The ROGEAP Programme Office treats a non-functional or under-reported GRM as a significant compliance gap.\n\nSource: ROGEAP GRM Operational Manual; ROGEAP §13; IFC PS1."
      }
    ],
    resources: [
      { label: "ROGEAP GRM Operational Manual (2023)", url: "https://ecowas.rogeap.org/wp-content/uploads/2023/10/GRM-Operational-Manual-ROGEAP-ECOWAS.pdf" },
      { label: "ROGEAP ESMS Guidelines (PDF) — §13 Grievance Mechanism", url: "https://ecowas.rogeap.org/wp-content/uploads/2023/10/ROGEAP_ESMS-Guidelines_v_01.pdf" },
      { label: "IFC PS1 — Assessment & Management of E&S Risks (§35-36 GRM)", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "IFC ESMS Toolkit Element 6 — Operational Control", url: "https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
      { label: "WB ESS10 — Stakeholder Engagement & GRM", url: "https://www.worldbank.org/en/projects-operations/environmental-and-social-framework" },
      { label: "CAO Grievance Mechanism Design Resources", url: "https://www.cao-ombudsman.org/accessing-cao/making-a-complaint/grievance-mechanism-resources" },
      { label: "OHCHR — Operational-level Grievance Mechanisms", url: "https://www.ohchr.org/sites/default/files/Documents/Publications/Guiding_Principles_Business_HR_EN.pdf" },
    ]
  },

};

// ═══════════════════════════════════════════════════════════
//  GUIDE TRANSLATION HELPER
// ═══════════════════════════════════════════════════════════
function useGuide(id) {
  const { lang } = useLang();
  const base = GUIDELINES_DB[id];
  if (!base || lang === "en") return base;
  const tr = GUIDE_TRANSLATIONS[lang]?.[id];
  if (!tr) return base;
  return {
    ...base,
    title:    tr.title    ?? base.title,
    summary:  tr.summary  ?? base.summary,
    sections: base.sections.map((sec, i) => ({
      ...sec,
      heading: tr.sections?.[i]?.heading ?? sec.heading,
      body:    tr.sections?.[i]?.body    ?? sec.body,
    })),
    resources: base.resources.map((res, i) => ({
      ...res,
      label: tr.resources?.[i]?.label ?? res.label,
    })),
  };
}

// ═══════════════════════════════════════════════════════════
//  GUIDELINES PANEL COMPONENT
// ═══════════════════════════════════════════════════════════
function GuidelinesPanel({ guideId, onClose }) {
  const { t, lang } = useLang();
  const guide = useGuide(guideId);
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
                  { label:"GOGLA ESMS Guidelines for Off-Grid Solar Companies (Standards Page)", url:"https://www.gogla.org/what-we-do/business-services-and-standards/" },
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
const CSV_FORMULA_TRIGGERS = new Set(['=', '+', '-', '@', '\t', '\r', '\n']);

function sanitizeCSVCell(value: string): string {
  const s = value.replace(/"/g, '""');
  // Prevent formula injection: prefix cells whose first character — or first
  // non-whitespace character — is a known spreadsheet formula trigger.
  // Checking the trimmed first char covers payloads padded with leading spaces
  // (e.g. " =WEBSERVICE(...)") that some parsers still evaluate as formulas.
  const firstChar = s[0];
  const firstNonWs = s.trimStart()[0];
  if (
    (firstChar !== undefined && CSV_FORMULA_TRIGGERS.has(firstChar)) ||
    (firstNonWs !== undefined && CSV_FORMULA_TRIGGERS.has(firstNonWs))
  ) {
    return '\t' + s;
  }
  return s;
}

function tableToCSV(columns, rows) {
  const hdr = columns.map(c=>`"${c.label}"`).join(',');
  const body = (rows||[]).map(row=>
    columns.map(c=>`"${sanitizeCSVCell((row[c.id]||'').toString())}"`).join(',')
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
      const labelHtml = sec.isPlaceholder
        ? `${esc(sec.label)}<span class="sample-tag">sample</span>`
        : esc(sec.label);
      const valClass = sec.isPlaceholder ? 'field-value sample-content' : 'field-value';
      body += `<div class="field"><div class="field-label">${labelHtml}</div><div class="${valClass}">${lines}</div></div>`;
    } else if (sec.type === 'checklist') {
      const labelHtml = sec.isPlaceholder
        ? `${esc(sec.label)}<span class="sample-tag">sample</span>`
        : esc(sec.label);
      const listClass = sec.isPlaceholder ? 'checklist sample-content' : 'checklist';
      body += `<div class="field"><div class="field-label">${labelHtml}</div><ul class="${listClass}">`;
      for (const item of (sec.items||[])) body += `<li>${esc(item)}</li>`;
      body += `</ul></div>`;
    } else if (sec.type === 'table') {
      const cols = sec.cols||[], rows = sec.rows||[];
      const tblLabel = sec.isPlaceholder ? `${esc(sec.label)} <span class="sample-tag">[SAMPLE]</span>` : esc(sec.label);
      body += `<div class="field-label">${tblLabel}</div>`;
      if (!rows.length) {
        body += `<p class="empty-note">${noEntries}</p>`;
      } else {
        const tblClass = sec.isPlaceholder ? 'table-wrap sample-table' : 'table-wrap';
        body += `<div class="${tblClass}"><table><thead><tr>`;
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
  .sample-content { color: #5F7080; font-style: italic; border-left-color: #B0C4D4;
                     background: #F7F9FC; }
  .checklist { margin: 4px 0 0 0; padding-left: 0; list-style: none; }
  .checklist li { padding: 3px 0 3px 22px; position: relative; font-size: 10.5pt; }
  .checklist li::before { content: "✓"; position: absolute; left: 4px; color: ${TEAL}; font-weight: 700; }
  .checklist.sample-content li { color: #5F7080; font-style: italic; }
  .checklist.sample-content li::before { color: #B0C4D4; }
  .sample-tag { font-size: 7.5pt; font-weight: 600; color: #A0B0C0; margin-left: 6px;
                font-style: normal; text-transform: uppercase; letter-spacing: 0.3px; }
  .infobox { background: #FFF8ED; border-left: 4px solid ${AMBER}; padding: 10px 14px;
              border-radius: 4px; font-style: italic; color: ${NAVY}; font-size: 10pt;
              margin: 10px 0; }
  .table-wrap { overflow: visible; margin-bottom: 14px; }
  .sample-table table { opacity: 0.85; }
  .sample-table th { background: #7F8C9A; }
  .sample-table td { color: #5F7080; font-style: italic; }
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

async function exportPDF(title, sections, strings={}) {
  const { jsPDF } = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');

  const html = buildPrintHTML(title, sections, strings);

  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const cssText = styleMatch ? styleMatch[1] : '';

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let bodyContent = bodyMatch ? bodyMatch[1] : html;
  bodyContent = bodyContent.replace(/<div[^>]*position:fixed[\s\S]*?<\/div>/g, '');
  bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/g, '');

  const styleEl = document.createElement('style');
  styleEl.id = '__pdf_export_style';
  styleEl.textContent = cssText;
  document.head.appendChild(styleEl);

  // Page dimensions and margins (all in mm)
  const pdfW = 210, pdfH = 297;
  const mL = 12, mR = 12, mT = 16, mB = 20;
  const contentW = pdfW - mL - mR;   // 186 mm usable width
  const contentH = pdfH - mT - mB;   // 261 mm usable height per page

  // Render at a pixel width proportional to the content area
  const containerPx = Math.round(contentW / pdfW * 794);

  const container = document.createElement('div');
  container.style.cssText = `position:absolute;left:-9999px;top:0;width:${containerPx}px;background:#ffffff;`;
  container.innerHTML = bodyContent;
  document.body.appendChild(container);

  await new Promise(r => setTimeout(r, 700));

  try {
    const canvas = await html2canvas(container, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: containerPx,
      windowWidth: containerPx,
    });

    const mmPerPx = contentW / canvas.width;

    // Convert content height from mm → pixels in the rendered canvas
    const contentH_px = Math.round(contentH / mmPerPx);
    // Look back up to 45 mm from the ideal cut point to find a safe white row
    const lookback_px = Math.round(45 / mmPerPx);

    // Read all pixel data once — used to find near-white rows between elements
    const ctx2d = canvas.getContext('2d');
    const imageData = ctx2d.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const W = canvas.width;

    // Scan backwards from targetRow to find the nearest row where every
    // sampled pixel is near-white (≥250). This lands cuts in whitespace
    // gaps between elements rather than through text or bordered boxes.
    const findSafeCut = (targetRow) => {
      const minRow = Math.max(0, targetRow - lookback_px);
      for (let row = targetRow; row >= minRow; row--) {
        let isWhite = true;
        for (let col = 0; col < W; col += 3) {
          const idx = (row * W + col) * 4;
          if (pixels[idx] < 250 || pixels[idx + 1] < 250 || pixels[idx + 2] < 250) {
            isWhite = false;
            break;
          }
        }
        if (isWhite) return row;
      }
      return targetRow; // fallback: use target if no white row found
    };

    // Pass 1: compute all page cut points by finding safe white-row boundaries
    const cuts = [0];
    while (true) {
      const last = cuts[cuts.length - 1];
      const target = last + contentH_px;
      if (target >= canvas.height) { cuts.push(canvas.height); break; }
      const safe = findSafeCut(target);
      // Guard against infinite loop if findSafeCut returns same position
      cuts.push(safe > last ? safe : target);
    }
    const totalPages = cuts.length - 1;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const finishPage = (pageNum) => {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, pdfH - mB, pdfW, mB, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(95, 112, 128);
      pdf.text(`Page ${pageNum} / ${totalPages}`, pdfW - mR - 2, pdfH - 6, { align: 'right' });
      pdf.setDrawColor(208, 220, 232);
      pdf.setLineWidth(0.3);
      pdf.line(mL, pdfH - mB + 3, pdfW - mR, pdfH - mB + 3);
    };

    // Pass 2: crop each slice onto its own canvas and add to PDF page.
    // Because each slice is cropped from exactly the safe-cut boundaries,
    // content is never split mid-element.
    for (let i = 0; i < totalPages; i++) {
      const sliceY   = cuts[i];
      const sliceH_px = cuts[i + 1] - sliceY;
      const sliceH_mm = sliceH_px * mmPerPx;

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width  = canvas.width;
      sliceCanvas.height = sliceH_px;
      const sliceCtx = sliceCanvas.getContext('2d');
      sliceCtx.drawImage(canvas, 0, sliceY, canvas.width, sliceH_px,
                                  0, 0,      canvas.width, sliceH_px);
      const sliceImg = sliceCanvas.toDataURL('image/jpeg', 0.90);

      if (i > 0) pdf.addPage();
      pdf.addImage(sliceImg, 'JPEG', mL, mT, contentW, sliceH_mm);
      finishPage(i + 1);
    }

    const fname = title.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_') || 'ESMS';
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${fname}.pdf`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 500);
  } finally {
    document.body.removeChild(container);
    const s = document.getElementById('__pdf_export_style');
    if (s) document.head.removeChild(s);
  }
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
      // No \highlight — widely incompatible; use bold + navy color + ruling line instead
      rtf += `{\\pard\\sb240\\sa60\\f0\\fs24\\b\\cf1 ${escRTF(sec.text)}\\par}`;
      rtf += `{\\pard\\sb0\\sa120\\brdrb\\brdrs\\brdrw10\\brsp60 \\par}`;
    } else if (sec.type === 'subheading') {
      rtf += `{\\pard\\sb180\\sa80\\f0\\fs22\\b\\cf2 ${escRTF(sec.text)}\\par}`;
    } else if (sec.type === 'label_value') {
      const sampleTag = sec.isPlaceholder ? '  [sample]' : '';
      rtf += `{\\pard\\sb100\\sa40\\fs18\\b\\cf5 ${escRTF((sec.label||'').toUpperCase())}${escRTF(sampleTag)}\\par}`;
      const val = sec.value || '(not completed)';
      const valFmt = sec.isPlaceholder ? `\\i\\cf5` : `\\cf0`;
      for (const line of val.split('\n')) {
        rtf += `{\\pard\\sa40\\fs20 ${valFmt} ${escRTF(line)}\\par}`;
      }
    } else if (sec.type === 'checklist') {
      const sampleTag = sec.isPlaceholder ? '  [sample]' : '';
      rtf += `{\\pard\\sb100\\sa40\\fs18\\b\\cf5 ${escRTF((sec.label||'').toUpperCase())}${escRTF(sampleTag)}\\par}`;
      const itemFmt = sec.isPlaceholder ? `\\i\\cf5` : `\\cf0`;
      for (const item of (sec.items||[])) {
        rtf += `{\\pard\\li360\\sa40\\fs20 ${itemFmt} \\u8226? ${escRTF(item)}\\par}`;
      }
    } else if (sec.type === 'table') {
      const sampleTag = sec.isPlaceholder ? '  [sample]' : '';
      rtf += `{\\pard\\sb100\\sa60\\fs18\\b\\cf5 ${escRTF((sec.label||'').toUpperCase())}${escRTF(sampleTag)}\\par}`;
      const cols = sec.cols||[], rows = sec.rows||[];
      if (!rows.length) {
        rtf += `{\\pard\\fs18\\i\\cf5 (no entries recorded)\\par}`;
      } else {
        // RTF tables: \trowd defines row, \cellx defines cumulative column widths,
        // \pard\intbl...\cell defines each cell, \row ends the row.
        // IMPORTANT: trowd/row pairs must NOT be wrapped in curly braces.
        const cw = Math.floor(8640 / Math.max(cols.length, 1));
        const rowFmt = sec.isPlaceholder ? `\\i\\cf5` : `\\cf0`;
        // Header row — single correct trowd block with cells then \row
        let pos = 0;
        rtf += `\\trowd\\trgaph80`;
        for (let i = 0; i < cols.length; i++) { pos += cw; rtf += `\\cellx${pos}`; }
        for (const c of cols) {
          rtf += `\\pard\\intbl\\b\\fs16\\cf1 ${escRTF(c.label)}\\cell `;
        }
        rtf += `\\row\n`;
        // Data rows
        for (const row of rows) {
          pos = 0;
          rtf += `\\trowd\\trgaph80`;
          for (let i = 0; i < cols.length; i++) { pos += cw; rtf += `\\cellx${pos}`; }
          for (const c of cols) {
            rtf += `\\pard\\intbl\\fs16 ${rowFmt} ${escRTF(String(row[c.id]||''))}\\cell `;
          }
          rtf += `\\row\n`;
        }
        rtf += `{\\pard\\sa120\\par}\n`;
      }
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
  try {
    const blob = new Blob([rtf], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fname}.rtf`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  } catch(e) {
    alert('Word/RTF download failed: ' + e.message);
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
    ppe_matrix: { label:t("toolLblPpe")||"PPE Matrix", cols:[
      {id:"task",label:t("ppeColTask")},{id:"hazard",label:t("ppeColHazard")},
      {id:"ppe_required",label:t("ppeColRequired")},{id:"standard",label:t("ppeColStandard")},
      {id:"provided",label:t("ppeColProvided")},{id:"inspected",label:t("colLastInspected")},
      {id:"your_spec",label:t("ppeColSpec")}
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

function buildPolicySections(esmsData, t) {
  const out = [{type:'heading',text: t ? t('navPolicies') : 'Organisational Policies'}];
  const policies = makePolicies(t || (k => k));
  for (const pol of policies) {
    const d = esmsData[`policy_${pol.id}`] || {};
    const polSecs = buildSinglePolicySections(pol, d);
    // polSecs[0]=heading, [1]=desc paragraph, [2]=infobox; use subheading instead
    out.push({type:'subheading', text: pol.label});
    out.push(...polSecs.slice(3));
    out.push({type:'spacer'});
  }
  return out;
}

function buildRiskSections(esmsData) {
  const stored = esmsData?.risk_register?.data;
  const hasData = Array.isArray(stored) && stored.length > 0;
  const rows = hasData ? stored : BASELINE_RISKS;
  const isPlaceholder = !hasData;
  const rated = rows.map(r=>{
    const score=parseInt(r.prob||1)*parseInt(r.sev||1);
    return {...r,rating:score>=9?'CRITICAL':score>=6?'HIGH':score>=3?'MEDIUM':'LOW'};
  });
  return [
    {type:'heading',text:'E&S Risk Register & Assessment'},
    {type:'infobox',text: isPlaceholder
      ? 'No risk register data saved yet. The table below shows a ROGEAP baseline for off-grid solar companies — review, customise, and save in the Risk Assessment section. Rows marked [sample] are pre-populated guidance only.'
      : 'Risk Rating = Probability × Severity. CRITICAL (9-16) | HIGH (6-8) | MEDIUM (3-5) | LOW (1-2). Source: ROGEAP ESMS Guidelines §4.'},
    {type:'table',label:'Risk Register',rows:rated,cols:[
      {id:'risk',label:'Risk / Hazard'},{id:'category',label:'Category'},
      {id:'prob',label:'Prob.'},{id:'sev',label:'Sev.'},{id:'rating',label:'Rating'},
      {id:'mitigation',label:'Mitigation'},{id:'responsible',label:'Responsible'},{id:'status',label:'Status'}
    ],isPlaceholder}
  ];
}

function buildComplianceSections(esmsData, t) {
  const stored = esmsData?.compliance_tracker?.data;
  const hasData = Array.isArray(stored) && stored.length > 0;
  const rows = hasData ? stored : COMPLIANCE_BASELINE;
  const isPlaceholder = !hasData;
  const cols = t
    ? getToolCSVDefs(t).compliance.cols.slice(0,7)
    : [{id:'law',label:'Law'},{id:'authority',label:'Authority'},{id:'requirement',label:'Key Requirement'},{id:'applies',label:'Applies?'},{id:'status',label:'Status'},{id:'expiry',label:'Expiry'},{id:'responsible',label:'Responsible'}];
  return [
    {type:'heading',text:'Legal & Regulatory Compliance Register'},
    {type:'infobox',text: isPlaceholder
      ? 'No compliance data saved yet. The table below shows a ROGEAP baseline for off-grid solar companies — review, adapt, and save in the Compliance section. Rows marked [sample] are pre-populated guidance only.'
      : 'Tracks all applicable national laws, regulations, permits, and voluntary standards. Review quarterly.'},
    {type:'table',label:t?t('csvLabelCompliance'):'Compliance Register',rows,cols,isPlaceholder}
  ];
}

function buildPlanSections(esmsData, t) {
  const out = [{type:'heading',text: t ? t('navPlans') : 'E&S Management Plans'}];
  for (const plan of PLAN_DEFS_SIMPLE) {
    const d = esmsData[`plan_${plan.id}`] || {};
    const planSecs = buildSinglePlanSections(plan, d, t);
    // planSecs[0]=heading, [1]=required para, [2]=intro para, [3]=infobox; use subheading instead
    const planTitle = t ? t(plan.lk) : (plan.label || plan.id);
    out.push({type:'subheading', text: planTitle});
    out.push(...planSecs.slice(4));
    out.push({type:'spacer'});
  }
  return out;
}

const TOOL_BASELINES = { ppe_matrix:PPE_BASELINE, stakeholder_register:STAKEHOLDER_BASELINE };
function buildToolSection(toolId, esmsData, t) {
  const defs = getToolCSVDefs(t);
  const def = defs[toolId];
  if (!def) return [];
  const raw = esmsData[`tool_${toolId}`]?.data;
  const hasData = Array.isArray(raw) && raw.length > 0;
  const baseline = TOOL_BASELINES[toolId] || [];
  const rows = hasData ? raw : baseline;
  const isPlaceholder = !hasData && rows.length > 0;
  const reg = TOOLS_REGISTRY[toolId];
  const title = (reg?.lk ? t(reg.lk) : null) || def.label;
  const secs = [{type:'heading',text:title}];
  if (isPlaceholder) secs.push({type:'infobox',text:`No data saved yet. The table below shows a pre-populated baseline — review and customise in the Implementation Tools section. Rows marked [sample] are pre-populated guidance only.`});
  secs.push({type:'table',label:def.label,rows,cols:def.cols,isPlaceholder});
  return secs;
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
    {type:'infobox',text:'Generated by ROGEAP ESMS Builder. Fields shown in italic with a [sample] label contain pre-populated guidance text — replace with your organisation\'s specific content before finalising.'},
    {type:'pagebreak'},
    ...buildScreeningSections(esmsData),{type:'pagebreak'},
    ...buildPolicySections(esmsData,t),{type:'pagebreak'},
    ...buildRiskSections(esmsData),{type:'pagebreak'},
    ...buildComplianceSections(esmsData,t),{type:'pagebreak'},
    ...buildPlanSections(esmsData,t),{type:'pagebreak'},
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
// isPlaceholder=true means value came from pre-populated sample text, not user input
function buildSinglePolicySections(pol, d) {
  const out = [
    {type:'heading', text: pol.label},
    {type:'paragraph', text: pol.desc || ''},
    {type:'infobox', text: 'Fields marked [sample] contain pre-populated guidance text. Replace with your organisation\'s specific content before finalising.'}
  ];
  for (const f of pol.fields) {
    const v = d[f.id];
    // For checklist fields: use saved value (sel), else fall back to all baseline items
    if (f.t === 'cbl') {
      if (v && typeof v === 'object' && Array.isArray(v.sel)) {
        const items = [
          ...(v.sel || []),
          ...(v.custom || []).filter(c => c.checked).map(c => c.text || c)
        ];
        if (items.length) out.push({type:'checklist', label: f.label, items, isPlaceholder: false});
      } else if (f.items?.length) {
        // No saved value — include all baseline items as sample content
        const items = f.items.map(i => i.text || i);
        if (items.length) out.push({type:'checklist', label: f.label, items, isPlaceholder: true});
      }
    } else {
      const stored = safe(v);
      const ph = f.ph || '';
      const isPlaceholder = !stored.trim() && !!ph.trim();
      const effectiveValue = stored.trim() ? stored : ph;
      if (effectiveValue.trim()) out.push({type:'label_value', label: f.label, value: effectiveValue, isPlaceholder});
    }
  }
  return out;
}

// ── Per-plan section builder ──
// ── Business Profile export sections builder ──────────────────────────────
function buildBPSections(esmsData, L, t, singleDef) {
  const out = [];
  const defs = singleDef ? [singleDef] : BUSINESS_PROFILE_DEFS;
  if (!singleDef) {
    out.push({ type:'heading', text: t('bpTitle') });
    out.push({ type:'paragraph', text: t('bpDesc') });
  }
  for (const def of defs) {
    const d = esmsData[`bp_${def.id}`] || {};
    out.push({ type:'heading', text:`${def.icon} ${t(def.lk)}` });
    out.push({ type:'paragraph', text: t(def.dk) });
    let hasContent = false;
    for (const f of def.fields) {
      const label = L[f.id] || f.id;
      let rawVal = (d[f.id] != null) ? String(d[f.id]) : '';
      if ((f.type === 'sel' || f.type === 'bool') && rawVal) rawVal = L[rawVal] || rawVal;
      const val = rawVal.trim();
      if (val) {
        hasContent = true;
        out.push({ type:'label_value', label, value:val, isPlaceholder:false });
      }
    }
    if (!hasContent) out.push({ type:'paragraph', text:'(No data entered for this sub-section.)' });
  }
  return out;
}

function buildSinglePlanSections(plan, d, t) {
  const out = [
    {type:'heading', text: t ? t(plan.lk) : (plan.label || '')},
    {type:'paragraph', text: `${plan.required || ''}`},
    {type:'paragraph', text: t ? t(plan.ik) : (plan.intro || '')},
    {type:'infobox', text: 'Fields marked [sample] contain pre-populated guidance text. Replace with your organisation\'s specific content before finalising.'}
  ];
  for (const f of plan.fields) {
    const v = d[f.id];
    const flabel = (t && f.lk) ? t(f.lk) : f.label;
    if (f.t === 'cbl') {
      if (v && typeof v === 'object' && Array.isArray(v.sel)) {
        const items = [
          ...(v.sel || []),
          ...(v.custom || []).filter(c => c.checked).map(c => c.text || c)
        ];
        if (items.length) out.push({type:'checklist', label: flabel, items, isPlaceholder: false});
      } else if (f.items?.length) {
        const items = f.items.map(i => i.text || i);
        if (items.length) out.push({type:'checklist', label: flabel, items, isPlaceholder: true});
      }
    } else if (f.t === 'table') {
      const rows = Array.isArray(v) && v.length > 0 ? v : (f.baseline || []);
      const isPlaceholder = !(Array.isArray(v) && v.length > 0);
      if (rows.length > 0) out.push({type:'table', label: flabel, cols: f.cols || [], rows, isPlaceholder});
    } else {
      const stored = safe(v);
      const ph = (t && f.phk) ? t(f.phk) : (f.ph || '');
      const isPlaceholder = !stored.trim() && !!ph.trim();
      const effectiveValue = stored.trim() ? stored : ph;
      if (effectiveValue.trim()) out.push({type:'label_value', label: flabel, value: effectiveValue, isPlaceholder});
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

  const run = async (type) => {
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
        await exportPDF(docTitle, secs, strings);
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
    setBusy(null);
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
    const compactBtn = {border:'none',borderRadius:6,padding:'5px 6px',cursor:'pointer',fontSize:10,fontWeight:700,fontFamily:F.b,display:'flex',alignItems:'center',justifyContent:'center',gap:4,flex:1,opacity:busy?0.65:1,pointerEvents:busy?'none':'auto'};
    return (
      <div style={{display:'flex',flexDirection:'column',gap:3}}>
        <div style={{fontSize:9,color:'rgba(255,255,255,0.45)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}>
          📥 {t('downloadFullEsms')||'Download Full ESMS'}
        </div>
        <div style={{display:'flex',gap:4}}>
          <button onClick={()=>run('pdf')} style={{...compactBtn,background:'rgba(192,57,43,0.28)',color:'rgba(255,200,200,0.95)',border:'1px solid rgba(192,57,43,0.45)'}}>
            {busy==='pdf'?'⏳':''} {busy==='pdf'?t('generating'):'📄 PDF'}
          </button>
          <button onClick={()=>run('word')} style={{...compactBtn,background:'rgba(42,95,158,0.32)',color:'rgba(180,210,255,0.95)',border:'1px solid rgba(42,95,158,0.5)'}}>
            {busy==='word'?'⏳':''} {busy==='word'?t('generating'):'📝 Word'}
          </button>
        </div>
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
  const [navKey, setNavKey] = useState(0);
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
  const goTo = (id) => { setNavKey(k => k + 1); setActive(id); if (mainRef.current) mainRef.current.scrollTop = 0; };
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

    // Reject files above 5 MB to prevent main-thread freeze from oversized payloads
    const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BACKUP_BYTES) {
      alert('Backup file is too large (maximum 5 MB). Please select a valid ESMS Builder backup file.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      alert('Could not read backup file. The file may be unreadable or corrupt.');
    };
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result as string);
        if (backup && backup.esmsData !== null && typeof backup.esmsData === 'object' && !Array.isArray(backup.esmsData)) {
          // Recursively validate structure bounds to prevent deeply nested oversized payloads
          const MAX_DEPTH = 10;
          const MAX_KEYS = 500;
          const MAX_ARRAY_LENGTH = 10_000;
          const MAX_STRING_LENGTH = 100_000;
          const isSafe = (node: unknown, depth: number): boolean => {
            if (depth > MAX_DEPTH) return false;
            if (typeof node === 'string') return node.length <= MAX_STRING_LENGTH;
            if (Array.isArray(node)) {
              if (node.length > MAX_ARRAY_LENGTH) return false;
              return node.every(item => isSafe(item, depth + 1));
            }
            if (node !== null && typeof node === 'object') {
              const keys = Object.keys(node as object);
              if (keys.length > MAX_KEYS) return false;
              return keys.every(k => isSafe((node as Record<string, unknown>)[k], depth + 1));
            }
            return true;
          };
          if (!isSafe(backup.esmsData, 0)) {
            alert('Backup file contains oversized data and cannot be restored. Please select a valid ESMS Builder backup file.');
            return;
          }
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
      case "business_profile": return <BusinessProfileSection esmsData={esmsData} setFieldValue={setFieldValue}/>;
      case "screening": return <ScreeningSection esmsData={esmsData} setFieldValue={setFieldValue} openGuide={openGuide}/>;
      case "policy": return <PolicySection esmsData={esmsData} setFieldValue={setFieldValue} openGuide={openGuide}/>;
      case "risks": return <RiskSection esmsData={esmsData} setFieldValue={setFieldValue} openGuide={openGuide}/>;
      case "compliance": return <ComplianceSection esmsData={esmsData} setFieldValue={setFieldValue} openGuide={openGuide}/>;
      case "plans": return <ManagementPlansSection esmsData={esmsData} setFieldValue={setFieldValue} openGuide={openGuide}/>;
      case "tools": return <ToolsSection esmsData={esmsData} setFieldValue={setFieldValue} openGuide={openGuide} setActive={goTo}/>;
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
        <div style={{ padding:sidebarOpen?"16px 12px":"12px 6px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, justifyContent:sidebarOpen?"flex-start":"center" }}>
            {sidebarOpen && <span style={{ fontSize:19, flexShrink:0 }}>🌿</span>}
            {sidebarOpen && <span style={{ color:"white", fontWeight:700, fontSize:14, fontFamily:F.d, whiteSpace:"nowrap", flex:1 }}>{t("appName")}</span>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? t("collapseNav") : t("expandNav")}
              aria-expanded={sidebarOpen}
              title={sidebarOpen ? "Collapse navigation" : "Expand navigation panel"}
              style={{
                background: sidebarOpen ? "none" : "rgba(14,124,123,0.4)",
                border: sidebarOpen ? "none" : "1.5px solid rgba(14,124,123,0.7)",
                color: sidebarOpen ? "rgba(255,255,255,0.5)" : "white",
                cursor:"pointer",
                fontSize: sidebarOpen ? 15 : 20,
                padding: sidebarOpen ? 6 : 8,
                flexShrink:0,
                minWidth: sidebarOpen ? 36 : 42,
                minHeight: sidebarOpen ? 36 : 42,
                display:"flex", alignItems:"center", justifyContent:"center",
                borderRadius:9,
                fontWeight: sidebarOpen ? 400 : 700,
                boxShadow: sidebarOpen ? "none" : "0 0 0 3px rgba(14,124,123,0.18)",
                transition:"all 0.2s",
              }}>
              {sidebarOpen ? "◀" : "▶"}
            </button>
          </div>
          {!sidebarOpen && (
            <div style={{ textAlign:"center", marginTop:6, fontSize:8, color:"rgba(255,255,255,0.38)", letterSpacing:"0.6px", userSelect:"none", fontWeight:600, textTransform:"uppercase" }}>
              expand
            </div>
          )}
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
        <nav aria-label="Sections" style={{ flex: isMobile ? 'none' : 1, padding:"9px 6px", overflowY: isMobile ? 'visible' : 'auto' }}>
          {NAV.map(item => {
            const isA = active === item.id;
            const {pct:navPct} = item.id!=="welcome" ? calcSectionProgress(item.id,esmsData) : {pct:0};
            const navBarCol = navPct===100 ? "#2ECC71" : navPct>0 ? "#F39C12" : "transparent";
            return (
              <button key={item.id}
                onClick={() => mobileGoTo(item.id)}
                aria-label={`${item.label}${item.id!=="welcome"&&navPct>0?` — ${navPct}%`:""}`}
                aria-current={isA ? "page" : undefined}
                className="nav-btn"
                style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:sidebarOpen?"8px 10px":"8px", justifyContent:sidebarOpen?"flex-start":"center", background:isA?"rgba(255,255,255,0.15)":"transparent", border:"none", borderRadius:7, cursor:"pointer", color:isA?"white":"rgba(255,255,255,0.65)", fontWeight:isA?700:400, fontSize:12, marginBottom:2, textAlign:"left", fontFamily:F.b, position:"relative", overflow:"hidden" }}
                onMouseEnter={e => { if(!isA) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { if(!isA) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize:14, flexShrink:0 }} aria-hidden="true">{item.icon}</span>
                {sidebarOpen && <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flex:1 }}>{item.label}</span>}
                {sidebarOpen && item.optional && <span style={{ fontSize:8, background:"rgba(255,193,7,0.22)", color:"#FFD54F", borderRadius:3, padding:"1px 4px", fontWeight:700, letterSpacing:0.4, flexShrink:0 }}>OPT</span>}
                {sidebarOpen && item.id!=="welcome" && navPct>0 && (
                  <span style={{ fontSize:9, fontWeight:700, color:navPct===100?"#2ECC71":"#F39C12", flexShrink:0, opacity:0.85 }}>{navPct}%</span>
                )}
                {item.id!=="welcome" && navPct>0 && (
                  <div style={{ position:"absolute", bottom:0, left:0, height:2, width:`${navPct}%`, background:navBarCol, transition:"width 0.35s ease" }} aria-hidden="true"/>
                )}
              </button>
            );
          })}
          {/* Scroll hint on mobile — reminds new users to scroll down for more sections */}
          {isMobile && sidebarOpen && (
            <div aria-hidden="true" style={{ textAlign:"center", padding:"10px 0 6px", color:"rgba(255,255,255,0.28)", fontSize:10, letterSpacing:"0.4px", userSelect:"none" }}>
              ↓ scroll to see downloads &amp; backup
            </div>
          )}
        </nav>

        {/* Gradient fade — sticks to the bottom of the visible sidebar on mobile */}
        {isMobile && <div className="sidebar-scroll-fade" aria-hidden="true"/>}

        {/* Bottom action buttons */}
        {sidebarOpen && (
          <div style={{ padding:"8px 10px", borderTop:"1px solid rgba(255,255,255,0.1)", display:"flex", flexDirection:"column", gap:4 }}>
            <ExportBar isFull={true} esmsData={esmsData} filename="Full_ESMS_Document" title="Full ESMS Document" sections={[]}/>
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:5, display:"flex", flexDirection:"column", gap:3 }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>{t("backupLabel")}</div>
              <div style={{ display:"flex", gap:3 }}>
                <button onClick={backupData}
                  style={{ flex:1, background:"rgba(14,124,123,0.25)", border:"1px solid rgba(14,124,123,0.5)", borderRadius:6, padding:"5px 4px", color:"rgba(150,230,228,0.9)", cursor:"pointer", fontSize:10, fontFamily:F.b, fontWeight:600 }}>
                  {t("backupSave")}
                </button>
                <label title="Restore from a .json backup file (max 5 MB)" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(42,95,158,0.2)", border:"1px solid rgba(42,95,158,0.4)", borderRadius:6, padding:"5px 4px", color:"rgba(160,200,255,0.9)", cursor:"pointer", fontSize:10, fontFamily:F.b, fontWeight:600, textAlign:"center" }}>
                  {t("backupRestore")}
                  <input type="file" accept=".json" aria-label="Restore data from backup file (max 5 MB)" onChange={e => { if(e.target.files?.[0]) { restoreData(e.target.files[0]); e.target.value=''; } }} style={{ display:"none" }}/>
                </label>
              </div>
              <button onClick={() => { if(window.confirm(t("resetConfirm"))) { setEsmsData({}); setActive("welcome"); } }}
                style={{ width:"100%", background:"rgba(192,57,43,0.2)", border:"1px solid rgba(192,57,43,0.4)", borderRadius:6, padding:"5px 0", color:"rgba(255,180,180,0.85)", cursor:"pointer", fontSize:10, fontFamily:F.b, fontWeight:600 }}>
                {t("resetData")}
              </button>
            </div>
            <div style={{ padding:"4px 8px", background:"rgba(255,255,255,0.04)", borderRadius:5, fontSize:9, color:"rgba(255,255,255,0.32)", lineHeight:1.4, textAlign:"center" }}>
              {t("dataPrivacyNotice")}
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <main id="main-content" ref={mainRef} className="app-main" role="main" style={{ flex:1, padding:"28px 32px 48px", overflowX:"hidden", overflowY:"auto", maxHeight:"100vh" }}>
        <div key={`${active}-${navKey}`} className="app-content-inner" style={{ maxWidth:1000, margin:"0 auto" }}>
          {active!=="welcome" && <SectionProgressBar sectionId={active} esmsData={esmsData}/>}
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
