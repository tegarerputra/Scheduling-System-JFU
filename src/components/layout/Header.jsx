import React from 'react'
import { LogOut, User } from 'lucide-react'
import { Button } from '../ui/Button'

export default function Header({ user, onLogout, showDebugInfo, toggleDebugInfo }) {
    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-blue-600">📅</span> Scheduling System
                    </h1>
                    <p className="text-xs text-slate-500 hidden sm:block">Ad Management Dashboard</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleDebugInfo}
                        className="text-xs text-slate-500"
                    >
                        {showDebugInfo ? 'Hide' : 'Show'} Debug
                    </Button>

                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                            <span className="text-xs text-slate-500">{user?.email}</span>
                        </div>
                        {user?.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt={user.name}
                                className="w-9 h-9 rounded-full ring-2 ring-slate-100"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-400" />
                            </div>
                        )}

                        <Button variant="ghost" size="icon" onClick={onLogout} title="Logout">
                            <LogOut className="w-4 h-4 text-slate-500" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
