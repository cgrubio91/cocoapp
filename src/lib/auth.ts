import { db, type User } from './db';

// Simple password hashing (for demo - use bcrypt in production!)
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}

// Session management
const SESSION_KEY = 'agrogold_session';

export function setCurrentUser(user: User) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        quotas: user.quotas
    }));
}

export function getCurrentUser(): User | null {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    try {
        return JSON.parse(session);
    } catch {
        return null;
    }
}

export function clearCurrentUser() {
    localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
    return getCurrentUser() !== null;
}

export function isSuperAdmin(): boolean {
    const user = getCurrentUser();
    return user?.role === 'superadmin';
}

// Login function
export async function login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
        const user = await db.users.where('email').equals(email).first();

        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        if (user.status === 'pending') {
            return { success: false, message: 'Tu cuenta está pendiente de aprobación' };
        }

        if (user.status === 'suspended') {
            return { success: false, message: 'Tu cuenta ha sido suspendida' };
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return { success: false, message: 'Contraseña incorrecta' };
        }

        setCurrentUser(user);
        return { success: true, message: 'Inicio de sesión exitoso', user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Error al iniciar sesión' };
    }
}

// Register function
export async function register(email: string, password: string, name: string): Promise<{ success: boolean; message: string }> {
    try {
        // Check if email already exists
        const existing = await db.users.where('email').equals(email).first();
        if (existing) {
            return { success: false, message: 'Este email ya está registrado' };
        }

        // Create new user (pending approval)
        const passwordHash = await hashPassword(password);
        await db.users.add({
            email,
            passwordHash,
            name,
            role: 'user',
            status: 'pending',
            quotas: {
                maxFarms: 1,
                maxLots: 5,
                maxCrops: 10,
                maxAnimals: 5,
                maxWorkers: 10,
                maxSuppliers: 10
            },
            createdAt: new Date()
        });

        return { success: true, message: 'Registro exitoso. Tu cuenta está pendiente de aprobación por el administrador.' };
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, message: 'Error al registrar usuario' };
    }
}

// Logout function
export function logout() {
    clearCurrentUser();
}
