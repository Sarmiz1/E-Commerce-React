// src/api/createResourceApi.js

export const createResourceApi = (table, select = "*") => {
  const applyFilters = (query, filters = []) => {
    filters.forEach(([column, operator, value]) => {
      if (typeof query[operator] === "function") {
        query = query[operator](column, value);
      }
    });
    return query;
  };

  return {
    key: table,

    list: async (supabase, filters = []) => {
      let query = supabase.from(table).select(select);
      query = applyFilters(query, filters);

      const { data, error } = await query;

      if (error) throw new Error(error.message);
      return data ?? [];
    },

    get: async (supabase, id) => {
      const { data, error } = await supabase
        .from(table)
        .select(select)
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    create: async (supabase, payload) => {
      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    update: async (supabase, id, payload) => {
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    remove: async (supabase, id) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
      return true;
    },
  };
};