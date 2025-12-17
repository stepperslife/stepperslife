"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp, Medal } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const leaderboard: any[] = [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return <div className="w-6 h-6 flex items-center justify-center font-bold">{rank}</div>;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/sales-performance" className="hover:text-foreground">Sales Performance</Link>
          <span>/</span>
          <span>Leaderboard</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Leaderboard</h1>
        <p className="text-muted-foreground mt-2">Compare with other team members</p>
      </div>

      {leaderboard.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No leaderboard data</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((member: any, index: number) => (
            <Card key={member.id} className={index < 3 ? "border-2 border-primary/20" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {getRankIcon(index + 1)}
                  <div className="flex-1">
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">Team Member</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{member.sales}</p>
                    <p className="text-sm text-muted-foreground">tickets</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
