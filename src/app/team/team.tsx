'use client'

import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { TeamMember } from '../data/team';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisVerticalIcon, PlusIcon, MinusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';


Chart.register(ArcElement, Tooltip, Legend);

export default function Team() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [newMemberName, setNewMemberName] = useState('');
    const [editMemberId, setEditMemberId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState<string>('');



    useEffect(() => {
        const storedTeam = localStorage.getItem('team');
        if (storedTeam) {
            setTeam(JSON.parse(storedTeam));
        }
    }, []);

    useEffect(() => {
        if (team.length > 0) {
            localStorage.setItem('team', JSON.stringify(team));
        }
    }, [team]);

    const addPoint = (id: number) => {
        setTeam(team.map(member => member.id === id ? { ...member, points: member.points + 1 } : member));
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
    };

    const editMemberName = (id: number, newName: string) => {
        setTeam(team.map(member => member.id === id ? { ...member, name: newName } : member));
        setEditMemberId(null);
        setEditingName("");
    };

    const colors = [
        '#FF5733',
        '#33FF57',
        '#FF33A1',
        '#3357FF',
        '#33FFF6',
        '#FFC733',
        '#A133FF',
        '#33FFB2',
        '#FF5733',
        '#3357FF',
    ];

    const data = {
        labels: team.map(member => member.name),
        datasets: [
            {
                data: team.map(member => member.points),
                backgroundColor: colors,
                hoverBackgroundColor: colors,
            },
        ],
    };

    return (
        <div className="content-height bg-gray-100 p-6 flex flex-col items-center">
            <div className="mb-4 flex w-full items-start">
                <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="New team member"
                    className="px-3 py-2 border rounded mr-2"
                />
                <button
                    onClick={addTeamMember}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Add Team Member
                </button>
            </div>

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
                    <div className="bg-white p-4 rounded shadow" style={{ width: '100%', height: '100%', maxWidth: '600px', maxHeight: '600px' }}>
                        <Pie data={data} />
                    </div>
                </div>
            </div>
        </div>
    );
}
