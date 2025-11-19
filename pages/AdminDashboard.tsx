
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { generateCourseOutline } from '../services/geminiService';

const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
];

const studentData = [
  { name: 'Jan', students: 240 },
  { name: 'Feb', students: 139 },
  { name: 'Mar', students: 980 },
  { name: 'Apr', students: 390 },
  { name: 'May', students: 480 },
  { name: 'Jun', students: 380 },
];

const Card: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-brand-dark/50 p-6 rounded-lg shadow-lg border border-gray-700 flex items-center space-x-4">
        <div className="bg-brand-primary/10 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const CourseOutlineGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [outline, setOutline] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!topic) {
            setError('Please enter a topic.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setOutline(null);
        try {
            const result = await generateCourseOutline(topic);
            setOutline(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-8 bg-brand-dark/50 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-brand-accent mb-4">Course Outline Generator (AI-Powered)</h3>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter course topic (e.g., 'React for Beginners')"
                    className="flex-grow bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-brand-primary focus:border-brand-primary"
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-brand-accent hover:bg-brand-accent/80 text-brand-dark font-bold py-2 px-6 rounded-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Generate'}
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {outline && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg max-h-96 overflow-y-auto">
                    <h4 className="text-lg font-bold text-brand-primary">{outline.courseTitle}</h4>
                    <p className="text-gray-300 mt-1 mb-4">{outline.courseDescription}</p>
                    {outline.modules.map((module: any, index: number) => (
                        <div key={index} className="mb-4">
                            <h5 className="font-semibold text-white">{`Module ${index + 1}: ${module.moduleTitle}`}</h5>
                            <ul className="list-disc list-inside ml-4 text-gray-400">
                                {module.lessons.map((lesson: string, lessonIndex: number) => (
                                    <li key={lessonIndex}>{lesson}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const AdminDashboard: React.FC = () => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
            <h1 className="text-4xl font-black text-brand-primary mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card title="Total Sales" value="$125,430" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                <Card title="Total Students" value="8,721" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <Card title="New Enrollments" value="+352 this month" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>} />
                <Card title="Courses" value="48" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422A12.083 12.083 0 0121 18.722M12 14v7m-6.16-7.578A12.083 12.083 0 013 18.722" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-brand-dark/50 p-6 rounded-lg shadow-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Monthly Sales</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#0A0F29', border: '1px solid #4338CA' }}/>
                            <Legend />
                            <Bar dataKey="sales" fill="#4338CA" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-brand-dark/50 p-6 rounded-lg shadow-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">New Students</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={studentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#0A0F29', border: '1px solid #4338CA' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="students" stroke="#F59E0B" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <CourseOutlineGenerator />

        </div>
    );
};

export default AdminDashboard;