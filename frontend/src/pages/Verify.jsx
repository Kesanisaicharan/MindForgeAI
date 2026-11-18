import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import api from '../lib/api';

const Verify = () => {
    const { certId } = useParams();
    const [state, setState] = useState({ status: 'loading' });

    useEffect(() => {
        api.get(`/api/certificates/verify/${certId}`)
            .then((res) => setState({ status: 'done', ...res.data }))
            .catch(() => setState({ status: 'done', valid: false }));
    }, [certId]);

    if (state.status === 'loading') return <div className="flex justify-center min-h-[40vh] items-center"><Loader2 className="animate-spin text-primary" size={48} /></div>;

    const d = state.data;
    return (
        <div className="max-w-xl mx-auto text-center py-16 text-gray-900 dark:text-white">
            {state.valid && d ? <ShieldCheck size={72} className="mx-auto text-green-500 mb-4" /> : <ShieldX size={72} className="mx-auto text-red-500 mb-4" />}
            <h1 className="text-3xl font-extrabold mb-4">{state.valid && d ? 'Certificate verified' : 'Certificate not valid'}</h1>
            {state.valid && d ? (
                <div className="card-glass rounded-2xl p-6 text-left space-y-2">
                    <p><b>Awarded to:</b> {d.userName}</p>
                    <p><b>Course:</b> {d.courseTitle}</p>
                    <p><b>Quiz score:</b> {d.score}%</p>
                    <p><b>Issued:</b> {new Date(d.issuedAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">{state.signatureChecked ? 'Digital signature checked.' : 'Recorded in the MindForgeAI database (issued before signatures were enabled).'}</p>
                </div>
            ) : <p className="text-gray-500">No matching certificate was found, or its details have been altered.</p>}
        </div>
    );
};

export default Verify;
