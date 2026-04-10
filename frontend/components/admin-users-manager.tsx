import { updateUserAccessAction } from "../app/admin/actions";

type AdminUser = {
  id: number;
  email: string;
  display_name: string;
  role: string;
  approved: boolean;
  family_access: boolean;
};

export function AdminUsersManager({
  demoEmail,
  users,
  notice
}: {
  demoEmail: string;
  users: AdminUser[];
  notice?: string;
}) {
  return (
    <section className="stack">
      <div className="panel section-card">
        <div className="eyebrow">Access Control</div>
        <h1 className="section-title">사용자 권한</h1>
        {notice ? <p className="inline-notice">최근 작업: {notice}</p> : null}
      </div>

      <div className="panel section-card">
        <div className="list">
          {users.map((member) => (
            <form className="card-link stack" key={member.id} action={updateUserAccessAction}>
              <input type="hidden" name="demoEmail" value={demoEmail} />
              <input type="hidden" name="userId" value={member.id} />
              <input type="hidden" name="returnTo" value="/admin/users" />
              <div>
                <h3>{member.display_name}</h3>
                <p>{member.email}</p>
              </div>
              <select name="role" defaultValue={member.role}>
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
              <label>
                <input type="checkbox" name="approved" defaultChecked={member.approved} /> approved
              </label>
              <label>
                <input
                  type="checkbox"
                  name="family_access"
                  defaultChecked={member.family_access}
                />{" "}
                family access
              </label>
              <button className="button secondary" type="submit">
                권한 저장
              </button>
            </form>
          ))}
        </div>
      </div>
    </section>
  );
}
