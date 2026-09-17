insert into public.jurisdictions (code, name, country_code)
values ('US-LA-MOREHOUSE', 'Morehouse Parish, Louisiana', 'US')
on conflict (code) do nothing;

-- No incentive is activated by seed data. A pilot reward requires an explicit,
-- funded program and administrative activation. Printed bottle markings alone
-- never create a local entitlement.
