(()=>{var a={};a.id=262,a.ids=[262],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8649:(a,b,c)=>{"use strict";c.d(b,{ui:()=>s,kg:()=>o,Nn:()=>u,CF:()=>m,_L:()=>r,ME:()=>v,hE:()=>p,ht:()=>n,MI:()=>q,Vb:()=>x,tG:()=>w,lU:()=>t});let d=require("node:sqlite"),e=require("node:path");var f=c.n(e);let g=require("node:fs");var h=c.n(g);let i=null;function j(){if(i)return i;let a=f().resolve(process.cwd(),"data");h().existsSync(a)||h().mkdirSync(a,{recursive:!0});let b=f().join(a,"docflow.db"),c=new d.DatabaseSync(b);return c.exec("PRAGMA journal_mode = WAL;"),c.exec("PRAGMA foreign_keys = ON;"),c.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar_url TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content_html TEXT NOT NULL,
      plain_text TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS document_shares (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('viewer', 'editor')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(document_id, user_id),
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS document_attachments (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_docs_owner ON documents(owner_id);
    CREATE INDEX IF NOT EXISTS idx_shares_doc ON document_shares(document_id);
    CREATE INDEX IF NOT EXISTS idx_shares_user ON document_shares(user_id);
  `),function(a){let b=a.prepare("SELECT COUNT(*) as count FROM users").get();if(b&&b.count>0)return;let c=Date.now(),d=a.prepare(`
    INSERT INTO users (id, name, email, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);d.run("user-alex","Alex Carter","alex@docflow.dev","AC",c),d.run("user-beatrice","Beatrice Vance","beatrice@docflow.dev","BV",c),d.run("user-charlie","Charlie Davis","charlie@docflow.dev","CD",c);let e=a.prepare(`
    INSERT INTO documents (id, title, content_html, plain_text, owner_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);e.run("doc-launch-plan","\uD83D\uDE80 DocFlow Product Launch Plan",`
    <h1>🚀 DocFlow Product Launch Plan</h1>
    <p>Welcome to <strong>DocFlow</strong>, the modern collaborative document editor inspired by Google Docs.</p>
    <h2>Key Capabilities</h2>
    <ul>
      <li><strong>Rich-text editing</strong>: Bold, italics, underline, headings, lists, quotes, and code blocks.</li>
      <li><strong>File upload & import</strong>: Turn Markdown, TXT, and DOCX files into documents.</li>
      <li><strong>Role-based sharing</strong>: Grant <em>Viewer</em> or <em>Editor</em> permissions seamlessly.</li>
      <li><strong>Instant persistence</strong>: Fully backed by SQLite with auto-save.</li>
    </ul>
    <blockquote>"Simplicity is the ultimate sophistication." — Leonardo da Vinci</blockquote>
    <p>Feel free to rename this document, edit the text, or click <strong>Share</strong> to invite your teammates.</p>
  `.trim(),"Welcome to DocFlow...","user-alex",c-36e5,c-36e5),e.run("doc-architecture","\uD83D\uDCD0 System Architecture & Specs",`
    <h1>📐 System Architecture & Specs</h1>
    <p>This technical specification outlines the core mechanics of our cloud persistence layer.</p>
    <h2>Architecture Overview</h2>
    <ol>
      <li>Node.js 24 + TypeScript with native SQLite engine.</li>
      <li>TipTap 3 headless ProseMirror core for rock-solid formatting.</li>
      <li>Zod schema validation on all API route endpoints.</li>
    </ol>
    <pre><code>// Clean access check example
if (role !== 'owner' && role !== 'editor') {
  return Response.json({ error: 'Permission denied' }, { status: 403 });
}</code></pre>
  `.trim(),"This technical specification...","user-beatrice",c-72e5,c-72e5),e.run("doc-marketing","\uD83D\uDCCA Q3 Marketing Strategy & Metrics",`
    <h1>📊 Q3 Marketing Strategy & Metrics</h1>
    <p>This document is shared with you as <u>Viewer</u> to review campaign highlights.</p>
    <h2>Goals & Milestones</h2>
    <ul>
      <li>Target 10,000 monthly active collaborative editors.</li>
      <li>Community engagement through live templates and file imports.</li>
    </ul>
  `.trim(),"This document is shared with you...","user-charlie",c-108e5,c-108e5);let f=a.prepare(`
    INSERT INTO document_shares (id, document_id, user_id, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);f.run("share-1","doc-architecture","user-alex","editor",c,c),f.run("share-2","doc-marketing","user-alex","viewer",c,c),f.run("share-3","doc-launch-plan","user-beatrice","editor",c,c),f.run("share-4","doc-launch-plan","user-charlie","viewer",c,c)}(c),i=c}let k=require("node:crypto");var l=c.n(k);function m(){return j().prepare("SELECT id, name, email, avatar_url, created_at FROM users ORDER BY name ASC").all()}function n(a){return j().prepare("SELECT id, name, email, avatar_url, created_at FROM users WHERE LOWER(email) = LOWER(?)").get(a)||null}function o(a,b){let c=j(),d=`user-${l().randomUUID()}`,e=Date.now(),f=a.split(" ").map(a=>a[0]).join("").substring(0,2).toUpperCase();return c.prepare(`
    INSERT INTO users (id, name, email, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(d,a,b,f,e),{id:d,name:a,email:b,avatar_url:f,created_at:e}}function p(a){let b=j(),c=b.prepare(`
    SELECT 
      d.id, d.title, d.content_html, d.plain_text, d.owner_id, d.created_at, d.updated_at,
      'owner' as user_role,
      u.name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar,
      (SELECT COUNT(*) FROM document_shares WHERE document_id = d.id) as collaborators_count
    FROM documents d
    JOIN users u ON d.owner_id = u.id
    WHERE d.owner_id = ?
    ORDER BY d.updated_at DESC
  `),d=b.prepare(`
    SELECT 
      d.id, d.title, d.content_html, d.plain_text, d.owner_id, d.created_at, d.updated_at,
      s.role as user_role,
      u.name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar,
      (SELECT COUNT(*) FROM document_shares WHERE document_id = d.id) as collaborators_count
    FROM documents d
    JOIN document_shares s ON d.id = s.document_id
    JOIN users u ON d.owner_id = u.id
    WHERE s.user_id = ?
    ORDER BY d.updated_at DESC
  `);return{owned:c.all(a).map(a=>({...a,collaborators_count:Number(a.collaborators_count)})),shared:d.all(a).map(a=>({...a,collaborators_count:Number(a.collaborators_count)}))}}function q(a,b){let c=j(),d=c.prepare("SELECT owner_id FROM documents WHERE id = ?").get(a);if(!d)return null;if(d.owner_id===b)return"owner";let e=c.prepare("SELECT role FROM document_shares WHERE document_id = ? AND user_id = ?").get(a,b);return e?e.role:null}function r(a,b){let c=q(a,b);if(!c)return null;let d=j().prepare(`
    SELECT 
      d.id, d.title, d.content_html, d.plain_text, d.owner_id, d.created_at, d.updated_at,
      u.name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar,
      (SELECT COUNT(*) FROM document_shares WHERE document_id = d.id) as collaborators_count
    FROM documents d
    JOIN users u ON d.owner_id = u.id
    WHERE d.id = ?
  `).get(a);return d?{...d,user_role:c,collaborators_count:Number(d.collaborators_count)}:null}function s(a,b="<p></p>",c="",d){let e=j(),f=`doc-${l().randomUUID()}`,g=Date.now();return e.prepare(`
    INSERT INTO documents (id, title, content_html, plain_text, owner_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(f,a,b,c,d,g,g),{id:f,title:a,content_html:b,plain_text:c,owner_id:d,created_at:g,updated_at:g}}function t(a,b){let c=j(),d=Date.now(),e=["updated_at = ?"],f=[d];return void 0!==b.title&&(e.push("title = ?"),f.push(b.title)),void 0!==b.contentHtml&&(e.push("content_html = ?"),f.push(b.contentHtml)),void 0!==b.plainText&&(e.push("plain_text = ?"),f.push(b.plainText)),f.push(a),c.prepare(`UPDATE documents SET ${e.join(", ")} WHERE id = ?`).run(...f),!0}function u(a){return j().prepare("DELETE FROM documents WHERE id = ?").run(a),!0}function v(a){return j().prepare(`
    SELECT 
      s.id as share_id,
      s.document_id,
      s.user_id,
      s.role,
      s.created_at,
      u.name as user_name,
      u.email as user_email,
      u.avatar_url as user_avatar
    FROM document_shares s
    JOIN users u ON s.user_id = u.id
    WHERE s.document_id = ?
    ORDER BY s.created_at ASC
  `).all(a)}function w(a,b,c){let d=j(),e=Date.now(),f=`share-${l().randomUUID()}`;d.prepare(`
    INSERT INTO document_shares (id, document_id, user_id, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(document_id, user_id) DO UPDATE SET
      role = excluded.role,
      updated_at = excluded.updated_at
  `).run(f,a,b,c,e,e);let g=j().prepare("SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?").get(b)||null;return{share_id:f,document_id:a,user_id:b,user_name:g.name,user_email:g.email,user_avatar:g.avatar_url,role:c,created_at:e}}function x(a,b){return j().prepare("DELETE FROM document_shares WHERE document_id = ? AND user_id = ?").run(a,b),!0}},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},53750:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>F,patchFetch:()=>E,routeModule:()=>A,serverHooks:()=>D,workAsyncStorage:()=>B,workUnitAsyncStorage:()=>C});var d={};c.r(d),c.d(d,{DELETE:()=>z,GET:()=>x,PUT:()=>y});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(8649),w=c(96505);async function x(a,b){try{let{id:c}=await b.params,d=a.headers.get("x-user-id")||"user-alex",e=(0,v._L)(c,d);if(!e)return u.NextResponse.json({error:"Document not found or access denied"},{status:404});return u.NextResponse.json({document:e})}catch(a){return console.error("Error fetching document:",a),u.NextResponse.json({error:"Failed to fetch document"},{status:500})}}async function y(a,b){try{let{id:c}=await b.params,d=a.headers.get("x-user-id")||"user-alex",e=(0,v.MI)(c,d);if(!e)return u.NextResponse.json({error:"Document not found or access denied"},{status:404});if("owner"!==e&&"editor"!==e)return u.NextResponse.json({error:"Viewers have read-only access and cannot edit this document"},{status:403});let f=await a.json(),g=w.at.safeParse(f);if(!g.success)return u.NextResponse.json({error:"Invalid input",details:g.error.flatten().fieldErrors},{status:400});(0,v.lU)(c,g.data);let h=(0,v._L)(c,d);return u.NextResponse.json({document:h})}catch(a){return console.error("Error updating document:",a),u.NextResponse.json({error:"Failed to update document"},{status:500})}}async function z(a,b){try{let{id:c}=await b.params,d=a.headers.get("x-user-id")||"user-alex",e=(0,v.MI)(c,d);if(!e)return u.NextResponse.json({error:"Document not found"},{status:404});if("owner"!==e)return u.NextResponse.json({error:"Only the document owner can delete this document"},{status:403});return(0,v.Nn)(c),u.NextResponse.json({success:!0})}catch(a){return console.error("Error deleting document:",a),u.NextResponse.json({error:"Failed to delete document"},{status:500})}}let A=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/documents/[id]/route",pathname:"/api/documents/[id]",filename:"route",bundlePath:"app/api/documents/[id]/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"D:\\Portfolio\\Ajaja test\\src\\app\\api\\documents\\[id]\\route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:B,workUnitAsyncStorage:C,serverHooks:D}=A;function E(){return(0,g.patchFetch)({workAsyncStorage:B,workUnitAsyncStorage:C})}async function F(a,b,c){var d;let e="/api/documents/[id]/route";"/index"===e&&(e="/");let g=await A.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||A.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===A.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>A.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>A.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await A.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},z),b}},l=await A.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await A.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},96487:()=>{},96505:(a,b,c)=>{"use strict";c.d(b,{Em:()=>g,L3:()=>h,at:()=>f,l3:()=>e});var d=c(45711);let e=d.Ik({title:d.Yj().trim().min(1,"Title cannot be empty").max(255,"Title is too long"),contentHtml:d.Yj().optional().default("<p></p>"),plainText:d.Yj().optional().default("")}),f=d.Ik({title:d.Yj().trim().min(1,"Title cannot be empty").max(255,"Title is too long").optional(),contentHtml:d.Yj().optional(),plainText:d.Yj().optional()}),g=d.Ik({userId:d.Yj().optional(),email:d.Yj().email("Invalid email address").optional(),role:d.k5(["viewer","editor"],{errorMap:()=>({message:"Role must be 'viewer' or 'editor'"})})}).refine(a=>a.userId||a.email,{message:"Either userId or email must be provided"}),h=d.Ik({name:d.Yj().trim().min(1,"Name is required").max(100),email:d.Yj().trim().email("Valid email is required")})}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[331,692,711],()=>b(b.s=53750));module.exports=c})();