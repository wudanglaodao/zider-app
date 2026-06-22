update public.printops_orders as printops
set
  installation_id = installation.id,
  member_id = coalesce(installation.member_id, printops.member_id),
  platform_store_profile_id = coalesce(installation.platform_store_profile_id, printops.platform_store_profile_id),
  updated_at = now(),
  workspace_id = coalesce(installation.workspace_id, printops.workspace_id)
from public.app_installations as installation
where printops.app_key = installation.app_key
  and printops.platform = installation.platform
  and printops.instance_id = installation.instance_id
  and (
    printops.installation_id is distinct from installation.id
    or (installation.member_id is not null and printops.member_id is distinct from installation.member_id)
    or (
      installation.platform_store_profile_id is not null
      and printops.platform_store_profile_id is distinct from installation.platform_store_profile_id
    )
    or (installation.workspace_id is not null and printops.workspace_id is distinct from installation.workspace_id)
  );
