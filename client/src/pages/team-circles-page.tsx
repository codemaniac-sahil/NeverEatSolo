import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle,
  Building,
  Calendar, 
  Check, 
  ChevronRight, 
  Loader2, 
  Plus, 
  Search, 
  Users, 
  UserPlus,
  X
} from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: number;
  name: string;
  description: string;
  managerId: number;
  organizationId: number;
  department: string;
  createdAt: Date;
}

interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  role: string;
  user: {
    id: number;
    username: string;
    name: string;
    profileImageUrl: string;
    title: string;
    department: string;
  };
}

interface UserBasic {
  id: number;
  name: string;
  username: string;
  email: string;
  profileImageUrl: string;
  title: string;
  department: string;
}

export default function TeamCirclesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    department: '',
  });
  const [activeTab, setActiveTab] = useState('my-teams');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch teams from the organization
  const { 
    data: teams,
    isLoading: isLoadingTeams,
    refetch: refetchTeams
  } = useQuery<Team[]>({
    queryKey: ['/api/organizations', user?.organizationId, 'teams'],
    enabled: !!user?.organizationId
  });

  // Fetch team members when a team is selected
  const { 
    data: teamMembers,
    isLoading: isLoadingMembers
  } = useQuery<TeamMember[]>({
    queryKey: ['/api/teams', selectedTeam?.id, 'members'],
    enabled: !!selectedTeam?.id
  });

  // Create new team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (teamData: any) => {
      const res = await apiRequest('POST', '/api/teams', {
        ...teamData,
        organizationId: user?.organizationId
      });
      return await res.json();
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      setNewTeam({ name: '', description: '', department: '' });
      refetchTeams();
      toast({
        title: 'Team created successfully',
        description: 'Your new team circle has been created.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create team',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle team creation
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name) {
      toast({
        title: 'Team name required',
        description: 'Please provide a name for your team.',
        variant: 'destructive',
      });
      return;
    }
    createTeamMutation.mutate(newTeam);
  };

  // Filter teams based on search query
  const filteredTeams = teams?.filter(team => {
    if (!searchQuery) return true;
    return (
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get my teams (where I'm a member or manager)
  const myTeams = filteredTeams?.filter(team => {
    if (team.managerId === user?.id) return true;
    return teamMembers?.some(member => member.userId === user?.id && member.teamId === team.id);
  });

  // Get all other teams in my organization
  const otherTeams = filteredTeams?.filter(team => {
    if (team.managerId === user?.id) return false;
    return !teamMembers?.some(member => member.userId === user?.id && member.teamId === team.id);
  });

  // If user doesn't belong to an organization
  if (!user?.organizationId) {
    return (
      <div className="container py-10">
        <div className="max-w-md mx-auto bg-muted p-6 rounded-md text-center">
          <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">No Organization Found</h1>
          <p className="text-sm text-muted-foreground mb-4">
            You need to be part of a corporate organization to view and create team circles.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingTeams) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Circles</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage team circles for easy lunch coordination
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team Circle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Team List */}
        <div className="md:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="my-teams">My Teams</TabsTrigger>
              <TabsTrigger value="all-teams">All Teams</TabsTrigger>
            </TabsList>
            <TabsContent value="my-teams" className="mt-4 space-y-2">
              {myTeams && myTeams.length > 0 ? (
                myTeams.map(team => (
                  <TeamCard 
                    key={team.id} 
                    team={team} 
                    isSelected={selectedTeam?.id === team.id}
                    onClick={() => setSelectedTeam(team)}
                    isManager={team.managerId === user?.id}
                  />
                ))
              ) : (
                <div className="text-center py-8 px-4 bg-muted rounded-md">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    You're not part of any teams yet.
                  </p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setActiveTab('all-teams')}
                  >
                    Browse all teams
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="all-teams" className="mt-4 space-y-2">
              {otherTeams && otherTeams.length > 0 ? (
                otherTeams.map(team => (
                  <TeamCard 
                    key={team.id} 
                    team={team} 
                    isSelected={selectedTeam?.id === team.id}
                    onClick={() => setSelectedTeam(team)}
                    isManager={false}
                  />
                ))
              ) : (
                <div className="text-center py-8 px-4 bg-muted rounded-md">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No other teams found in your organization.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column - Team Details */}
        <div className="md:col-span-2">
          {selectedTeam ? (
            <TeamDetails 
              team={selectedTeam} 
              members={teamMembers || []}
              isLoading={isLoadingMembers}
              isManager={selectedTeam.managerId === user?.id}
              currentUserId={user?.id || 0}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-muted rounded-md p-10">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Select a Team</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Select a team from the list to view details, members, and manage team activities.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team Circle</DialogTitle>
            <DialogDescription>
              Create a team circle to coordinate lunch and social activities with your work colleagues.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateTeam}>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input 
                  id="team-name" 
                  placeholder="Enter team name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="team-department">Department</Label>
                <Input 
                  id="team-department" 
                  placeholder="Engineering, Marketing, etc."
                  value={newTeam.department}
                  onChange={(e) => setNewTeam({...newTeam, department: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="team-description">Description</Label>
                <Textarea 
                  id="team-description" 
                  placeholder="Describe your team circle..."
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTeamMutation.isPending}>
                {createTeamMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create Team
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamCard({ 
  team, 
  isSelected, 
  onClick,
  isManager
}: { 
  team: Team; 
  isSelected: boolean;
  onClick: () => void;
  isManager: boolean;
}) {
  return (
    <div 
      className={`p-3 rounded-md cursor-pointer border transition-colors ${
        isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50 hover:bg-accent'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="font-medium text-sm">{team.name}</h3>
            {isManager && (
              <Badge variant="outline" className="ml-2 text-xs">Manager</Badge>
            )}
          </div>
          {team.department && (
            <p className="text-xs text-muted-foreground mt-1">{team.department}</p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function TeamDetails({ 
  team, 
  members,
  isLoading,
  isManager,
  currentUserId
}: { 
  team: Team; 
  members: TeamMember[];
  isLoading: boolean;
  isManager: boolean;
  currentUserId: number;
}) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');
  const { toast } = useToast();

  const handleScheduleLunch = () => {
    // Implement lunch scheduling logic
    toast({
      title: 'Coming Soon',
      description: 'The ability to schedule team lunches is coming soon!',
    });
  };

  const isMember = members.some(member => member.userId === currentUserId);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{team.name}</CardTitle>
            {team.department && (
              <CardDescription>{team.department}</CardDescription>
            )}
          </div>
          {(isManager || isMember) && (
            <Button onClick={handleScheduleLunch}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Lunch
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {team.description && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">{team.description}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Team Members</h3>
            {isManager && (
              <Button variant="outline" size="sm" onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Members
              </Button>
            )}
          </div>
          
          <Separator />
          
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : members.length > 0 ? (
            <div className="space-y-2">
              {members.map(member => (
                <div key={member.id} className="flex items-center p-2 rounded-md hover:bg-muted">
                  <div className="h-8 w-8 rounded-full bg-muted overflow-hidden mr-3">
                    {member.user.profileImageUrl ? (
                      <img 
                        src={member.user.profileImageUrl} 
                        alt={member.user.name} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/10">
                        <span className="text-xs font-medium text-primary">
                          {member.user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-sm">{member.user.name}</span>
                      {member.userId === team.managerId && (
                        <Badge variant="secondary" className="ml-2 text-xs">Team Lead</Badge>
                      )}
                      {member.userId === currentUserId && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </div>
                    {member.user.title && (
                      <span className="text-xs text-muted-foreground">{member.user.title}</span>
                    )}
                  </div>
                  {isManager && member.userId !== currentUserId && (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No members in this team yet.
              </p>
              {isManager && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setIsInviteDialogOpen(true)}
                >
                  Invite members
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      {!isManager && !isMember && (
        <CardFooter>
          <Button className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Join Team
          </Button>
        </CardFooter>
      )}
      
      {/* Invite Members Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
            <DialogDescription>
              Search and add colleagues to your team circle.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
              {/* This would normally show search results */}
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  User search functionality coming soon.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled>
              Invite Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}