'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Étape 1 : chercher l'utilisateur par nom dans la table profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('nom', nom)
      .single();

    if (profileError || !profileData) {
      alert('Nom invalide ou utilisateur introuvable');
      return;
    }

    const userId = profileData.id;

    // Étape 2 : récupérer l’email bidon lié à ce user dans Supabase Auth
    const { data: userData, error: userError } = await supabase
      .from('users') // table `auth.users` n'est pas exposée en direct, donc on utilise rpc ou workaround
      .select('email')
      .eq('id', userId)
      .single();

    // Si tu n’as pas accès à `auth.users`, on re-génère l’email comme à la création :
    const email = `${nom.replace(/\s+/g, '').toLowerCase()}@app.local`;

    // Étape 3 : connexion avec l’email fictif
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      alert('Mot de passe incorrect ou utilisateur invalide');
      return;
    }

    // Étape 4 : récupérer le rôle
    const { data: roleData, error: roleError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', loginData.user.id)
      .single();

    if (roleData?.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (roleData?.role === 'technicien') {
      router.push('/technicien/accueil');
    } else {
      alert('Rôle inconnu.');
    }
  };

  return (
    <main className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Connexion</h1>
      <form onSubmit={handleLogin} className="space-y-4 w-full max-w-xs">
        <input
          type="text"
          placeholder="Nom"
          className="border p-2 w-full"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="border p-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 w-full rounded">
          Se connecter
        </button>
      </form>
    </main>
  );
}
