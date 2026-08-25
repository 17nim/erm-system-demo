import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import capitalize from "@/utils/stringHelper";

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="grid gap-4">
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight md:text-nowrap">
        My Profile
      </h1>
      <Card>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <p className="text-muted-foreground text-xl" id="name">
                {`${user?.first_name} ${user?.last_name}`}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <p className="text-muted-foreground text-xl" id="employeeId">
                {user?.user_id}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <p className="text-muted-foreground text-xl" id="email">
                {user?.email}
              </p>
            </div>
            <div className="grid grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="division">Division</Label>
                <p className="text-muted-foreground text-xl" id="division">
                  {user?.division}
                </p>
              </div>
              <div className="grid gap-2 order-5">
                <Label htmlFor="role">Role</Label>
                <p className="text-muted-foreground text-xl" id="role">
                  {user?.role && capitalize(user.role)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
