'use client'

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { TeamMember } from '../data/team';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisVerticalIcon, PlusIcon, MinusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

Chart.register(CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend);

export default function Team() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [newMemberName, setNewMemberName] = useState('');
    const [editMemberId, setEditMemberId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState<string>('');
    const [lateLimit, setLateLimit] = useState<number>(3);
    const [punishment, setPunishment] = useState<string>('Bake a cake');


    useEffect(() => {
        const storedTeam = localStorage.getItem('team');
        if (storedTeam) {
            setTeam(JSON.parse(storedTeam));
        }

        const storedLimit = localStorage.getItem('lateLimit');
        if (storedLimit) {
            setLateLimit(parseInt(storedLimit));
        }

        const storedPunishment = localStorage.getItem('punishment');
        if (storedPunishment) {
            setPunishment(storedPunishment);
        }
    }, []);

    useEffect(() => {
        if (team.length > 0) {
            localStorage.setItem('team', JSON.stringify(team));
        }
    }, [team]);

    useEffect(() => {
        try {
            localStorage.setItem('lateLimit', lateLimit.toString());
        } catch (error) {
            console.error('Fehler beim Speichern des Limits im lokalen Speicher:', error);
        }
    }, [lateLimit]);

    useEffect(() => {
        try {
            localStorage.setItem('punishment', punishment);
        } catch (error) {
            console.error('Fehler beim Speichern der Bestrafung im lokalen Speicher:', error);
        }
    }, [punishment]);

    const addPoint = (id: number) => {
        setTeam(team.map(member => {
            if (member.id === id && member.points < lateLimit) {
                const updatedPoints = member.points + 1;
                return { ...member, points: updatedPoints };
            } else {
                return member;
            }
        }));
    };

    const removePoint = (id: number) => {
        setTeam(team.map(member => member.id === id ? { ...member, points: Math.max(0, member.points - 1) } : member));
    };

    const addTeamMember = () => {
        if (newMemberName.trim() === '') return;

        const newMember: TeamMember = {
            id: team.length > 0 ? team[team.length - 1].id + 1 : 1,
            name: newMemberName,
            points: 0,
        };

        setTeam([...team, newMember]);
        setNewMemberName('');
    };

    const removeTeamMember = (id: number) => {
        setTeam(team.filter(member => member.id !== id));
        removeLastItem();
    };

    const removeLastItem = () => {
        if (team.length! > 0) {
            localStorage.removeItem('team');
        }
    }

    const clearPoints = () => {
        setTeam(team.map(member => ({ ...member, points: 0 })));
    };

    const editMemberName = (id: number, newName: string) => {
        setTeam(team.map(member => member.id === id ? { ...member, name: newName } : member));
        setEditMemberId(null);
        setEditingName("");
    };

    const data = {
        labels: team.map(member => member.name),
        datasets: [
            {
                label: 'Delays',
                data: team.map(member => Math.min(member.points, lateLimit)),
                backgroundColor: '#4299E1',
                hoverBackgroundColor: '#2C5282',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Delays in the team',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: lateLimit,
            },
        },
    };

    return (
        <div className="content-height bg-gray-100 p-6 flex flex-col items-center">
            <div className="mb-4 flex w-full flex-col items-start">
            <label className='mb-2 font-semibold'>Add Team Member</label>
                <div>
                <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="New team member"
                    className="px-3 py-2 border rounded mb-4 mr-2"
                />
                <button
                    onClick={addTeamMember}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Add Team Member
                </button>
                </div>
                <label className="mb-2 font-semibold">Delay Limit</label>
                <input
                    type="number"
                    value={lateLimit}
                    onChange={(e) => setLateLimit(parseInt(e.target.value))}
                    placeholder="Late Limit"
                    className="pl-3 py-2 border rounded mb-4 w-12"
                />
                <label className="mb-2 font-semibold">Punishment</label>
                <input
                    type="text"
                    value={punishment}
                    onChange={(e) => setPunishment(e.target.value)}
                    placeholder="Punishment"
                    className="px-3 py-2 border rounded mb-4 w-1/6"
                />
                <button
                    onClick={clearPoints}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Clear Points
                </button>
            </div>

            {team.some(member => member.points >= lateLimit) && (
                <div className="mb-4 w-1/3 bg-yellow-500 text-white p-4 rounded shadow">
                    <p>One or more members have exceeded the limit of {lateLimit} delays! <br /> The punishment is: <strong>{punishment}</strong></p>
                </div>
            )}

            <div className="flex w-full">
                <ul className="w-1/4 max-h-[600px] overflow-y-auto bg-white p-4 rounded shadow">
                    {team.map(member => (
                        <li key={member.id} className="flex justify-between items-center mb-2 p-2 bg-gray-100 rounded shadow">
                            {editMemberId === member.id ? (
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onBlur={() => editMemberName(member.id, editingName)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            editMemberName(member.id, editingName);
                                            setEditMemberId(null);
                                        }
                                    }}
                                    autoFocus
                                    className="px-3 py-2 border rounded mr-2"
                                />
                            ) : (
                                <span>{member.name}</span>
                            )}
                            <div className="flex items-center">
                                <PlusIcon
                                    className='w-5 h-5 text-green-600 hover:text-green-400 mr-2 hover:cursor-pointer'
                                    aria-hidden="true"
                                    onClick={() => addPoint(member.id)}
                                ></PlusIcon>
                                <span className="mr-2">{member.points}</span>
                                <MinusIcon
                                    className='w-5 h-5 text-red-600 hover:text-red-400 mr-2 hover:cursor-pointer'
                                    aria-hidden="true"
                                    onClick={() => removePoint(member.id)}
                                ></MinusIcon>

                                <Menu as="div" className="relative inline-block text-left">
                                    <MenuButton className="p-2">
                                        <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" aria-hidden="true" />
                                    </MenuButton>
                                    <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                        <MenuItem>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => {
                                                        setEditingName(member.name);
                                                        setEditMemberId(member.id);
                                                    }}
                                                    className={`${active ? 'bg-gray-200' : 'hover:bg-gray-200'
                                                        } flex items-center px-4 py-2 text-sm w-full`}
                                                >
                                                    <PencilIcon className="w-5 h-5 text-gray-600" />
                                                    &nbsp;
                                                    Edit
                                                </button>
                                            )}
                                        </MenuItem>
                                        <MenuItem>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => removeTeamMember(member.id)}
                                                    className={`${active ? 'bg-gray-200' : 'text-gray-900'
                                                        } flex items-center px-4 py-2 text-sm w-full`}
                                                >
                                                    <TrashIcon className='w-5 h-5 text-gray-600'></TrashIcon>
                                                    &nbsp;
                                                    Remove
                                                </button>
                                            )}
                                        </MenuItem>
                                    </MenuItems>
                                </Menu>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="w-1/2 flex justify-center items-center">
                    <div className="bg-white p-4 rounded shadow" style={{ width: '100%', height: '100%', maxWidth: '700px', maxHeight: '700px' }}>
                        <Bar data={data} options={options} />
                    </div>
                </div>
            </div>
        </div>
    );
}