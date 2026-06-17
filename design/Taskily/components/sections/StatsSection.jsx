import Link from 'next/link';
import StatCard from '@/components/ui/StatCard';

export default function StatsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <Link href="/dashboard/projects">
        <StatCard 
          title="Total Projects" 
          value="24" 
          trend="5▲" 
          subtext="Increased from last month" 
          active 
        />
      </Link>
      <Link href="/dashboard/projects?status=ended">
        <StatCard 
          title="Ended Projects" 
          value="10" 
          trend="6▲" 
          subtext="Increased from last month" 
        />
      </Link>
      <Link href="/dashboard/projects?status=running">
        <StatCard 
          title="Running Projects" 
          value="12" 
          trend="2▲" 
          subtext="Increased from last month" 
        />
      </Link>
      <Link href="/dashboard/projects?status=pending">
        <StatCard 
          title="Pending Project" 
          value="2" 
          trend="On Discuss" 
          subtext="" 
        />
      </Link>
    </div>
  );
}
