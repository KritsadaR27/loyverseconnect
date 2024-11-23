

export default function ClientComponent() {
    return (
        <div>
            <h1 className="text-4xl text-center p-60 bg-slate-100">    Hey!!</h1>
        </div>
    );
}

// // Server Component (No 'use client' directive)
// export default async function ServerDataFetching() {
//     const response = await fetch('http://host.docker.internal:8083/api/suppliers');
//     const data = await response.json(); // Fetch and parse data on the server

//     return (
//         <div>
//             <h1>Data from Server</h1>
//             <pre>{JSON.stringify(data, null, 2)}</pre> {/* Render the fetched data */}
//         </div>
//     );
// }


// 'use client';

// import { useEffect, useState } from 'react';

// export default function ClientDataFetching() {
//     const [data, setData] = useState(null);

//     useEffect(() => {
//         async function fetchData() {
//             const response = await fetch('http://localhost:8083/api/suppliers');
//             const result = await response.json();
//             setData(result);
//         }
//         fetchData();
//     }, []); // Empty dependency array means it will run once when the component mounts

//     return (
//         <div>
//             <h1>Data from Client</h1>
//             {data === null ? (
//                 <p>Loading...</p>
//             ) : (
//                 <pre>{JSON.stringify(data, null, 2)}</pre>
//             )}
//         </div>
//     );
// }
